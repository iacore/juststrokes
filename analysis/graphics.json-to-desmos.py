# coding: utf-8
a=[[143,18,126,89,67,149,0,200,219,164],[119,122,215,105,227,162,166,237,176,88]]
for stroke in a:
    r = "{"
    for point in zip(stroke[::2], stroke[1::2]):
        r += f"({point[0]},{point[1]}),"
    r = r[:-1] + "}"
    print(r)
    
