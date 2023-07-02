const VectorFunctions = {
  distance2(p0, p1) {
    return VectorFunctions.norm2(VectorFunctions.subtract(p0, p1))
  },
  norm2(p) {
    return p[0] * p[0] + p[1] * p[1]
  },
  round(p: Point): Point {
    return p.map(Math.round) as Point
  },
  subtract(p0, p1) {
    return [p0[0] - p1[0], p0[1] - p1[1]]
  },
}

function orDefault(maybe_null, dflt) {
  return null == maybe_null ? dflt : maybe_null
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

function get_aabb(strokes): AABB {
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

/**
 * 
 * @param {points} stroke 
 * @param {integer} how_many_points_to_sample 
 * @returns 
 */
function downsample_stroke(stroke, how_many_points_to_sample) {
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

function preprocess_strokes(strokes, h) {
  if (
    0 === strokes.length ||
    strokes.some(t => 0 === t.length)
  )
    throw new Error("Invalid medians list: " + JSON.stringify(strokes))
  var o = h.side_length,
    aabb_after = func4(get_aabb(strokes), h.max_ratio, h.min_width)
  let s: AABB = [
    [0, 0],
    [h.side_length - 1, h.side_length - 1],
  ]
  let c = createNormilizedProjectFunction(aabb_after, s)
  return strokes.map(n => {
    var a = downsample_stroke(n.map(c), h.points),
      e = VectorFunctions.subtract(a[a.length - 1], a[0]),
      i = Math.atan2(e[1], e[0]),
      u = Math.round(((i + Math.PI) * o) / (2 * Math.PI)) % o,
      s = Math.round(Math.sqrt(VectorFunctions.norm2(e) / 2))
    return [].concat.apply([], a).concat([u, s])
  })
}

export type Point = [number, number]

function func4(aabb: AABB, max_ratio: number, min_width: number) {
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

function func6(t, n, r) {
  var e = 0, i = r.points
  for (var h = 0; h < t.length; h++) {
    var o = t[h], u = n[h]
    for (var s = 0; i > s; s++)
      (e -= Math.abs(o[2 * s] - u[2 * s])),
        (e -= Math.abs(o[2 * s + 1] - u[2 * s + 1]))
    var c = Math.abs(o[2 * i] - u[2 * i]),
      f = (o[2 * i + 1] + u[2 * i + 1]) / r.side_length
    e -= 4 * i * f * Math.min(c, r.side_length - c)
  }
  return e
}

/** CJK Character */
export type Ideograph = string

export type Stroke = Point[]

export type Medians = Uint8Array[2]

export type MatcherOptions = {
  points: number
  max_ratio: number
  max_width: number
  side_length: number
}

export class Matcher {
  private _params: MatcherOptions
  /** Magic sauce */
  private _medians: Array<[Ideograph, Medians]>

  constructor(medians: Array<[Ideograph, Medians]>, options?: Partial<MatcherOptions>) {
    this._medians = medians
    this._params = {
      points: 4,
      max_ratio: 1,
      max_width: 8,
      side_length: 256,
      ...options
    }
  }

  preprocess(strokes) {
    return preprocess_strokes(strokes, this._params)
  }

  match(strokes: Stroke[], how_many_candidates = 1) {
    if (0 === strokes.length) return []
    let candidates: Ideograph[] = []
    let scores: number[] = []
    strokes = this.preprocess(strokes)
    var codepoint_like = 0
    while (true) {
      if (codepoint_like >= this._medians.length) break
      let candidate = this._medians[codepoint_like++]
      if (candidate[1].length === strokes.length) {
        for (
          var c = func6(strokes, candidate[1], this._params), f = scores.length;
          f > 0 && c > scores[f - 1];

        )
          f -= 1
        how_many_candidates > f &&
          (candidates.splice(f, 0, candidate[0]),
            scores.splice(f, 0, c),
            candidates.length > how_many_candidates && (candidates.pop(), scores.pop()))
      }
    }
    return candidates
  }
}
