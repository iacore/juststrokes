# coding: utf-8
a = [[21,0,105,28,186,62,250,120,148,183],[5,129,89,162,173,197,240,255,148,189]]
    
for stroke in a:
    r = "{"
    for point in zip(stroke[::2], stroke[1::2]):
        r += f"({point[0]},{point[1]}),"
    r = r[:-1] + "}"
    print(r)
    
