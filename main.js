var canvas = document.getElementById('viewport')

canvas.style.width = '400px';
canvas.style.height = '400px';

var ctx = getContext('2d')

function quickInverse(m){
    return [
        [m[0][0], m[1][0], m[2][0], 0.0],
        [m[0][1], m[1][1], m[2][1], 0.0],
        [m[0][2], m[1][2], m[2][2], 0.0],
        [
            -(m[3][0] * m[0][0] + m[3][1] * m[0][1] + m[3][2] * m[0][2]),
            -(m[3][0] * m[1][0] + m[3][1] * m[1][1] + m[3][2] * m[1][2]),
            -(m[3][0] * m[2][0] + m[3][1] * m[2][1] + m[3][2] * m[2][2]),
        ]
    ]
}

var width = canvas.width, height = canvas.height
var a = height / width
var fovTheta = 90
var FOV = 1 / tan(fovTheta / 2)
var zFar = 1000, zNear = 0.1

var q = zFar / (zFar - zNear)
var q2 = -zNear * q

var projectionMatrix = [
    [a * FOV, 0,   0, 0],
    [0,     FOV,   0, 0],
    [0,       0,   q, 1],
    [0,       0, -q2, 0]
];

var currentColor = [255, 255, 255]

function fill3d(r, g, b){
    currentColor = [r, g, b]
}

var LIGHT = Vector(0.5, 0.5, 1).normalize()

var shade = [50, 50, 50]