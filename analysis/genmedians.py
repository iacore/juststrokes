import json, sys

def process_strokes(strokes):
    minx, miny, maxx, maxy = 100000, 100000, 0, 0

    for stroke in strokes:
        for point in stroke:
            x = point[0]
            y = point[1]
            minx=min(minx, x)
            miny=min(miny, y)
            maxx=max(maxx, x)
            maxy=max(maxy, y)

    ans = []
    for stroke in strokes:
        a_stroke = []
        for point in stroke:
            a_stroke.append(  (point[0]-minx)/(maxx-minx)*256 )
            a_stroke.append(  ( (point[1]-miny)/(maxy-miny)) *256 )
        ans.append(a_stroke)
    return ans

output = []
for line in open("graphics.txt"):
    o = json.loads(line)
    output.append([o["character"], process_strokes(o["medians"])])

json.dump(output, sys.stdout, separators=(',',':'), ensure_ascii=False)
