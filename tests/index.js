var serial = require("../src/serialjs");

function Point(x, y)
{
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function()
{
    return "(" + this.x + ";" + this.y + ")";
};

serial.registerSerializable(Point, "obs_point");


function Line(x1, y1, x2, y2)
{
    this.p1 = new Point(x1, y1);
    this.p2 = new Point(x2, y2);
    console.log("Build with constructor");
};

Line.prototype.toString = function()
{
    return "Line from: " + this.p1.toString() + " to: " + this.p2.toString();
};

Line.prototype._getJSON = function()
{
    return [this.p1, this.p2];
};

Line.prototype._initFromJSON = function(pts)
{
    this.p1 = pts[0];
    this.p2 = pts[1];
    console.log("Build with unserialize");
}

serial.registerSerializable(Line, "obs_line");


var l = new Line(1, 3, 8, 7);
console.log(l.toString());

var data = serial.serialize(l);
console.log(data);

var l2 = serial.unserialize(data);
console.log(l2.toString());
