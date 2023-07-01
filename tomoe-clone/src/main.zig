const std = @import("std");
const testing = std.testing;

pub const Point = struct {
    x: i32,
    y: i32,
};

pub const Stroke = []Point;

pub const TomoeMetric = struct {
    a: i32,
    b: i32,
    c: i32,
    d: f64,
    e: i32,
    angle: f64,

    pub fn calc(p1: Point, p2: Point) {

    }

    pub fn from_stroke(_stroke: Stroke) @This() {
        if (_stroke.len == 0) {
            unreachable; // I don't want to handle this
        }
        const stroke = if (_stroke.len == 1)
            &.{ _stroke[0], _stroke[0] }
        else
            _stroke;
        
        for (0.., 1..stroke.len) |i1, i2| {
            const p1 = stroke[i1];
            const p2 = stroke[i2];
            x1 = p1->x;
            y1 = p1->y;
            x2 = p2->x;
            y2 = p2->y;
            m[i].a     = x2 - x1;
            m[i].b     = y2 - y1;
            m[i].c     = x2 * y1 - y2 * x1;
            m[i].d     = m[i].a * m[i].a + m[i].b * m[i].b;
            m[i].e     = m[i].a * x1 + m[i].b * y1;
            m[i].angle = atan2 (y2 - y1, x2 - x1);
        }
    }
};

// export fn add(a: i32, b: i32) i32 {
//     return a + b;
// }

// test "basic add functionality" {
//     try testing.expect(add(3, 7) == 10);
// }

// metrics
// generate metrics
//
// score3
// score1
// score2
