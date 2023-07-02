const VectorFunctions = {
  distance2(p0: Point, p1: Point) {
    return VectorFunctions.norm2(VectorFunctions.subtract(p0, p1))
  },
  norm2(p: Point) {
    return p[0] * p[0] + p[1] * p[1]
  },
  round(p: Point): Point {
    return p.map(Math.round) as Point
  },
  subtract(p0: Point, p1: Point): Point {
    return [p0[0] - p1[0], p0[1] - p1[1]]
  },
}

/** 
 * Map point from pair0's aabb to pair1 aabb
 */
function createNormilizedProjectFunction(aabb0: AABB, aabb1: AABB): (x: Point) => Point {
  var diff0 = VectorFunctions.subtract(aabb0[1], aabb0[0]),
    diff1 = VectorFunctions.subtract(aabb1[1], aabb1[0]),
    diffratio = [diff1[0] / diff0[0], diff1[1] / diff0[1]]
  return point => [
    Math.round(diffratio[0] * (point[0] - aabb0[0][0]) + aabb1[0][0]),
    Math.round(diffratio[1] * (point[1] - aabb0[0][1]) + aabb1[0][1]),
  ]
}

export type AABB = [Point, Point]

function get_aabb(strokes: Stroke[]): AABB {
  var p_min: Point = [1 / 0, 1 / 0]
  var p_max: Point = [-(1 / 0), -(1 / 0)]
  return strokes.map(points => points.map(point => {
    (p_min[0] = Math.min(p_min[0], point[0])),
      (p_min[1] = Math.min(p_min[1], point[1])),
      (p_max[0] = Math.max(p_max[0], point[0])),
      (p_max[1] = Math.max(p_max[1], point[1]))
  })),
    [p_min, p_max]
}

/** downsample and append 2 number metrics */
function process_stroke(stroke: Stroke, how_many_points_to_sample: number): Stroke {
  var result_stroke: Stroke = []
  var stroke_length = 0
  for (var i = 0; i < stroke.length - 1; i++)
    stroke_length += Math.sqrt(VectorFunctions.distance2(stroke[i], stroke[i + 1]))
  var h = 0, point_cadidate = stroke[0], u = 0
  for (var i = 0; how_many_points_to_sample - 1 > i; i++) {
    for (var s = (i * stroke_length) / (how_many_points_to_sample - 1); s > u;) {
      var c = Math.sqrt(VectorFunctions.distance2(point_cadidate, stroke[h + 1]))
      if (s > u + c) (h += 1), (point_cadidate = stroke[h]), (u += c)
      else {
        var f = (s - u) / c;
        (point_cadidate = [
          (1 - f) * point_cadidate[0] + f * stroke[h + 1][0],
          (1 - f) * point_cadidate[1] + f * stroke[h + 1][1],
        ]),
          (u = s)
      }
    }
    result_stroke.push(VectorFunctions.round(point_cadidate))
  }
  result_stroke.push(stroke[stroke.length - 1])
  return result_stroke
}

const NUM_POSSIBLE_ENCODED_VALUE = 256

function preprocess_strokes(strokes: Stroke[], opts: MatcherOptions): StrokeProcessed[] {
  if (
    0 === strokes.length ||
    strokes.some(t => 0 === t.length)
  )
    throw new Error("Invalid medians list: " + JSON.stringify(strokes))
  const side_length = NUM_POSSIBLE_ENCODED_VALUE
  const aabb_after = do_something_to_aabb(get_aabb(strokes), opts.max_ratio, opts.min_width)
  let s: AABB = [
    [0, 0],
    [NUM_POSSIBLE_ENCODED_VALUE - 1, NUM_POSSIBLE_ENCODED_VALUE - 1],
  ]
  let c = createNormilizedProjectFunction(aabb_after, s)
  return strokes.map(n => {
    const stroke_processed = process_stroke(n.map(c), NUM_ENCODED_POINTS)
    const stroke_span = VectorFunctions.subtract(stroke_processed[stroke_processed.length - 1], stroke_processed[0])
    const stroke_angle = Math.atan2(stroke_span[1], stroke_span[0])
    /**
     * when stroke_angle == -PI, metric_u = 0
     * when stroke_angle == PI, metric_u = 256 (side_length)
     * basically, it's encoding angle to u8
     */
    const angle_encoded = Math.round(
      ((stroke_angle + Math.PI) * side_length) / (2 * Math.PI)
    ) % side_length
    const length_encoded = Math.round(Math.sqrt(VectorFunctions.norm2(stroke_span) / 2))
    return [...stroke_processed.flat(), angle_encoded, length_encoded]
  })
}

export type Point = [number, number]

/** not sure what this does */
function do_something_to_aabb(aabb: AABB, max_ratio: number, min_width: number) {
  aabb = aabb.map(VectorFunctions.round) as AABB
  var e = VectorFunctions.subtract(aabb[1], aabb[0])
  if (e[0] < 0 || e[1] < 0) throw e
  if (e[0] < min_width) {
    var i = Math.ceil((min_width - e[0]) / 2);
    (aabb[0][0] -= i), (aabb[1][0] += i)
  }
  if (e[1] < min_width) {
    var i = Math.ceil((min_width - e[1]) / 2);
    (aabb[0][1] -= i), (aabb[1][1] += i)
  }
  if (max_ratio > 0)
    if (((e = VectorFunctions.subtract(aabb[1], aabb[0])), e[0] < e[1] / max_ratio)) {
      var i = Math.ceil((e[1] / max_ratio - e[0]) / 2);
      (aabb[0][0] -= i), (aabb[1][0] += i)
    } else if (e[1] < e[0] / max_ratio) {
      var i = Math.ceil((e[0] / max_ratio - e[1]) / 2);
      (aabb[0][1] -= i), (aabb[1][1] += i)
    }
  return aabb
}

function score_similarity(input: StrokeProcessed[], reference: StrokeProcessed[]): number {
  var score = 0
  for (var i = 0; i < input.length; i++) {
    var input_stroke = input[i], ref_stroke = reference[i]
    for (var s = 0; s < NUM_ENCODED_POINTS; s++) {
      score -= Math.abs(input_stroke[2 * s] - ref_stroke[2 * s])
      score -= Math.abs(input_stroke[2 * s + 1] - ref_stroke[2 * s + 1])
    }
    const c = Math.abs(input_stroke[2 * NUM_ENCODED_POINTS] - ref_stroke[2 * NUM_ENCODED_POINTS])
    const angle_similarity = Math.min(c, NUM_POSSIBLE_ENCODED_VALUE - c)
    const lengthy = (input_stroke[2 * NUM_ENCODED_POINTS + 1] + ref_stroke[2 * NUM_ENCODED_POINTS + 1]) / NUM_POSSIBLE_ENCODED_VALUE

    // // this is my addition. it didn't help
    // const length_diff = Math.abs(input_stroke[2 * NUM_ENCODED_POINTS + 1] - ref_stroke[2 * NUM_ENCODED_POINTS + 1])

    const MAGIC_PER_STROKE_WEIGHT = 4
    score -= MAGIC_PER_STROKE_WEIGHT * NUM_ENCODED_POINTS * lengthy * angle_similarity
  }
  return score
}

/** CJK Character */
export type Ideograph = string

export type Stroke = Point[]

const NUM_ENCODED_POINTS = 4
/** x0,y0,x1,y1,x2,y2,x3,y3,angle_encoded,length_encoded */
export type StrokeProcessed = [...(number[] & { length: typeof NUM_ENCODED_POINTS }), number, number]

export type MatcherOptions = {
  max_ratio: number
  /** also called `max_width` once in source code */
  min_width: number
}

export class Matcher {
  private _params: MatcherOptions
  /** Magic sauce */
  private _medians: Array<[Ideograph, StrokeProcessed[]]>

  constructor(medians: Array<[Ideograph, StrokeProcessed[]]>, options?: Partial<MatcherOptions>) {
    this._medians = medians
    this._params = {
      max_ratio: 1,
      min_width: 8,
      ...options
    }
  }

  preprocess(strokes: Stroke[]) {
    return preprocess_strokes(strokes, this._params)
  }

  match(strokes: Stroke[], how_many_candidates = 1) {
    if (0 === strokes.length) return []
    let candidates: Ideograph[] = []
    let scores: number[] = []
    const strokes2 = this.preprocess(strokes)
    var codepoint_like = 0
    while (true) {
      if (codepoint_like >= this._medians.length) break
      let candidate = this._medians[codepoint_like++]
      if (candidate[1].length === strokes2.length) {
        for (
          var score = score_similarity(strokes2, candidate[1]), f = scores.length;
          f > 0 && score > scores[f - 1];

        )
          f -= 1
        how_many_candidates > f &&
          (candidates.splice(f, 0, candidate[0]),
            scores.splice(f, 0, score),
            candidates.length > how_many_candidates && (candidates.pop(), scores.pop()))
      }
    }
    return candidates
  }
}
