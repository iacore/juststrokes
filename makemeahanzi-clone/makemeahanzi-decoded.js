const VectorFunctions = {
  distance2(p0, p1) {
    return VectorFunctions.norm2(VectorFunctions.subtract(p0, p1))
  },
  norm2(p) {
    return p[0] * p[0] + p[1] * p[1]
  },
  round(p) {
    return p.map(Math.round)
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
 * 
 * @param {pair of ponits} pair0 
 * @param {pair of ponits} pair1 
 * @returns 
 */
function createNormilizedProjectFunction(pair0, pair1) {
  var diff0 = VectorFunctions.subtract(pair0[1], pair0[0]),
    diff1 = VectorFunctions.subtract(pair1[1], pair1[0]),
    diffratio = [diff1[0] / diff0[0], diff1[1] / diff0[1]]
  return point => [
    Math.round(diffratio[0] * (point[0] - pair0[0][0]) + pair1[0][0]),
    Math.round(diffratio[1] * (point[1] - pair0[0][1]) + pair1[0][1]),
  ]
}

function get_aabb(strokes) {
  var p_min = [1 / 0, 1 / 0]
  var p_max = [-(1 / 0), -(1 / 0)]
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
  var result_stroke = []
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

function func4(stroke_aa, r, a) {
  stroke_aa = stroke_aa.map(VectorFunctions.round)
  var e = VectorFunctions.subtract(stroke_aa[1], stroke_aa[0])
  if (e[0] < 0 || e[1] < 0) throw e
  if (e[0] < a) {
    var i = Math.ceil((a - e[0]) / 2);
    (stroke_aa[0][0] -= i), (stroke_aa[1][0] += i)
  }
  if (e[1] < a) {
    var i = Math.ceil((a - e[1]) / 2);
    (stroke_aa[0][1] -= i), (stroke_aa[1][1] += i)
  }
  if (r > 0)
    if (((e = VectorFunctions.subtract(stroke_aa[1], stroke_aa[0])), e[0] < e[1] / r)) {
      var i = Math.ceil((e[1] / r - e[0]) / 2);
      (stroke_aa[0][0] -= i), (stroke_aa[1][0] += i)
    } else if (e[1] < e[0] / r) {
      var i = Math.ceil((e[0] / r - e[1]) / 2);
      (stroke_aa[0][1] -= i), (stroke_aa[1][1] += i)
    }
  return stroke_aa
}
function func5(n, h) {
  if (
    0 === n.length ||
    n.some(t => 0 === t.length)
  )
    throw new Error("Invalid medians list: " + JSON.stringify(n))
  var o = h.side_length,
    u = func4(get_aabb(n), h.max_ratio, h.min_width),
    s = [
      [0, 0],
      [h.side_length - 1, h.side_length - 1],
    ],
    c = createNormilizedProjectFunction(u, s)
  return n.map(n => {
    var a = downsample_stroke(n.map(c), h.points),
      e = VectorFunctions.subtract(a[a.length - 1], a[0]),
      i = Math.atan2(e[1], e[0]),
      u = Math.round(((i + Math.PI) * o) / (2 * Math.PI)) % o,
      s = Math.round(Math.sqrt(VectorFunctions.norm2(e) / 2))
    return [].concat.apply([], a).concat([u, s])
  })
}
function func6(t, n, r, a) {
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

const Matcher = (() => {
  function t(r, a) {
    babelHelpers.classCallCheck(this, t),
      (a = a || {}),
      (a.points = orDefault(a.points, 4)),
      (a.max_ratio = orDefault(a.max_ratio, 1)),
      (a.min_width = orDefault(a.max_width, 8)),
      (a.side_length = orDefault(a.side_length, 256)),
      (this._medians = r),
      (this._params = a)
  }
  return (t.prototype.match = (() => {
    function t(t, n) {
      if (0 === t.length) return []
      n = n || 1
      var r = [],
        a = []
      t = this.preprocess(t)
      for (
        var e = this._medians,
        i = Array.isArray(e),
        h = 0,
        e = i ? e : e[Symbol.iterator]();
        ;

      ) {
        var u
        if (i) {
          if (h >= e.length) break
          u = e[h++]
        } else {
          if (((h = e.next()), h.done)) break
          u = h.value
        }
        var s = u
        if (s[1].length === t.length) {
          for (
            var c = func6(t, s[1], this._params), f = a.length;
            f > 0 && c > a[f - 1];

          )
            f -= 1
          n > f &&
            (r.splice(f, 0, s[0]),
              a.splice(f, 0, c),
              r.length > n && (r.pop(), a.pop()))
        }
      }
      return r
    }
    return t
  })()),
    (t.prototype.preprocess = (() => {
      function t(t) {
        return func5(t, this._params)
      }
      return t
    })()),
    t
})()