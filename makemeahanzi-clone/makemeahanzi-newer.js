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
function func1(n, r) {
  var a = [], e = 0
  for (var i = 0; i < n.length - 1; i++)
    e += Math.sqrt(VectorFunctions.distance2(n[i], n[i + 1]))
  var h = 0, o = n[0], u = 0
  for (var i = 0; r - 1 > i; i++) {
    for (var s = (i * e) / (r - 1); s > u;) {
      var c = Math.sqrt(VectorFunctions.distance2(o, n[h + 1]))
      if (s > u + c) (h += 1), (o = n[h]), (u += c)
      else {
        var f = (s - u) / c;
        (o = [
          (1 - f) * o[0] + f * n[h + 1][0],
          (1 - f) * o[1] + f * n[h + 1][1],
        ]),
          (u = s)
      }
    }
    a.push(VectorFunctions.round(o))
  }
  return a.push(n[n.length - 1]), a
}
function func2(pair0 /* pair of ponits */, pair1) {
  var a = VectorFunctions.subtract(pair0[1], pair0[0]),
    e = VectorFunctions.subtract(pair1[1], pair1[0]),
    i = [e[0] / a[0], e[1] / a[1]]
  return point => [
    Math.round(i[0] * (point[0] - pair0[0][0]) + pair1[0][0]),
    Math.round(i[1] * (point[1] - pair0[0][1]) + pair1[0][1]),
  ]
}
function func3(t) {
  var n = [1 / 0, 1 / 0],
    r = [-(1 / 0), -(1 / 0)]
  return t.map(t => t.map(t => {
    (n[0] = Math.min(n[0], t[0])),
      (n[1] = Math.min(n[1], t[1])),
      (r[0] = Math.max(r[0], t[0])),
      (r[1] = Math.max(r[1], t[1]))
  })),
    [n, r]
}
function func4(n, r, a) {
  n = n.map(VectorFunctions.round)
  var e = VectorFunctions.subtract(n[1], n[0])
  if (e[0] < 0 || e[1] < 0) throw e
  if (e[0] < a) {
    var i = Math.ceil((a - e[0]) / 2);
    (n[0][0] -= i), (n[1][0] += i)
  }
  if (e[1] < a) {
    var i = Math.ceil((a - e[1]) / 2);
    (n[0][1] -= i), (n[1][1] += i)
  }
  if (r > 0)
    if (((e = VectorFunctions.subtract(n[1], n[0])), e[0] < e[1] / r)) {
      var i = Math.ceil((e[1] / r - e[0]) / 2);
      (n[0][0] -= i), (n[1][0] += i)
    } else if (e[1] < e[0] / r) {
      var i = Math.ceil((e[0] / r - e[1]) / 2);
      (n[0][1] -= i), (n[1][1] += i)
    }
  return n
}
function func5(n, h) {
  if (
    0 === n.length ||
    n.some(t => 0 === t.length)
  )
    throw new Error("Invalid medians list: " + JSON.stringify(n))
  var o = h.side_length,
    u = func4(func3(n), h.max_ratio, h.min_width),
    s = [
      [0, 0],
      [h.side_length - 1, h.side_length - 1],
    ],
    c = func2(u, s)
  return n.map(n => {
    var a = func1(n.map(c), h.points),
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