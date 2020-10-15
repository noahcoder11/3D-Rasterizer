var canvas = document.getElementById('viewport')

canvas.width = 400;
canvas.height = 400;

var ctx = canvas.getContext('2d')

var keys = {}
            
document.onkeydown = function(e){
    keys[e.key] = true
}
document.onkeyup = function(e){
    keys[e.key] = false
}

function triangle(x1, y1, x2, y2, x3, y3){
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.closePath()
    ctx.fill()
}

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
var FOV = 1 / Math.tan(fovTheta / 2)
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

var LIGHT = new Vector(0.5, 0.5, 1).normalize()

var shade = [50, 50, 50]

var Camera = new Vector(0, 0, 0);

var camLook = new Vector(0, 0, 0)

var yaw = 0;

var speed = 3;

var vUp = new Vector(0, 1, 0), vTarget = new Vector(0, 0, 1);

var matView,

updateCamera = function() {
    vTarget = Camera.add(camLook);
    
	var newForward = (vTarget.sub(Camera)).normalize();
	
	var a = newForward.scale(vUp.dot(newForward));
	
	var newUp = vUp.sub(a).normalize();

	var newRight = newUp.cross(newForward);
    
    if (keys.q) {
        Camera.y -= 5;
    } else if (keys.e) {
        Camera.y += 5;
    }
    
    var moveRight = newRight.normalize().scale(speed);
    
    if (keys.a) {
        Camera = Camera.sub(moveRight);
    } else if (keys.d) {
        Camera = Camera.add(moveRight);
    }
    
    var Forward = camLook.scale(speed);
    
    if (keys.ArrowLeft) {
        yaw -= 3;
    } else if (keys.ArrowRight) {
        yaw += 3;
    }
    
    if (keys.w) {
        Camera = Camera.add(Forward);
    } else if (keys.s) {
        Camera = Camera.sub(Forward);
    }
    
    vUp = new Vector(0, 1, 0);
    
    vTarget = new Vector(0, 0, 1);
	
	var matCameraRot = vTarget.rotateY(yaw);
	
	camLook = matCameraRot;
	
	LIGHT = camLook.normalize();
	
	var pointAt = [
        [newRight.x,   newRight.y,   newRight.z,   0],
        [newUp.x,      newUp.y,      newUp.z,      0],
        [newForward.x, newForward.y, newForward.z, 0],
        [Camera.x,         Camera.y,     Camera.z, 1]
    ];
    
    matView = quickInverse(pointAt);
};

var translations = [], rotations = [], scalations = [], matrices = [];

var pushMatrix3d = function(){
    matrices.push([translations.length, rotations.length, scalations.length]);
};

var scale3d = function(x, y, z){
    if(y === undefined || y === null){
        y = x;
        z = x;
    }
    
    scalations.push([x, y, z]);
};

var translate3d = function(x, y, z){
    translations.push([x, y, z]);
};

var rotate3d = function(xtheta, ytheta, ztheta){
    rotations.push([xtheta, ytheta, ztheta]);
};

var popMatrix3d = function(){
    var m = matrices[matrices.length-1];
    if(translations.length > m[0]){
        translations.splice(m[0], m.length-m[0]);
    }
    if(rotations.length > m[1]){
        rotations.splice(m[1], m.length-m[1]);
    }
    if(scalations.length > m[2]){
        scalations.splice(m[2], m.length-m[2]);
    }
};

var lookAtTri = function(tri){
    var n = tri.slice(0);
    
    n[0] = n[0].VecMatMult(matView, 1);
    n[1] = n[1].VecMatMult(matView, 1);
    n[2] = n[2].VecMatMult(matView, 1);
    
    return n;
};

var vector_IntersectPlane = function(plane_p, plane_n, lineStart, lineEnd){
    plane_n = plane_n.normalize();
    
    var plane_d = -plane_p.dot(plane_n);
    var ad = lineStart.dot(plane_n);
    var bd = lineEnd.dot(plane_n);
    var t = (-plane_d - ad) / (bd - ad);
    var lineStartToEnd = lineEnd.sub(lineStart);
    var lineToIntersect = lineStartToEnd.scale(t);
    
    var nv = lineStart.add(lineToIntersect);
    
    return nv;
};

var triangle_ClipAgainstPlane = function(plane_p, plane_n, in_tri, out_tris) {
    plane_n = plane_n.normalize();
	
	var _dist = function(p) {
	    plane_p = plane_p.normalize();
	    
	    return p.sub(plane_p).dot(plane_n) / Math.sqrt(plane_n.x*plane_n.x + plane_n.y*plane_n.y + plane_n.z*plane_n.z);
	};
	
	var inside_points = [], outside_points = [];
	
	var d0 = _dist(in_tri[0]), d1 = _dist(in_tri[1]), d2 = _dist(in_tri[2]);
	
	if (d0 >= 0) { 
	    inside_points[inside_points.length] = in_tri[0];
	} else {
	    outside_points[outside_points.length] = in_tri[0];
	}
	if (d1 >= 0) {
	    inside_points[inside_points.length] = in_tri[1]; 
	} else {
	    outside_points[outside_points.length] = in_tri[1];
	}
	if (d2 >= 0) {
	    inside_points[inside_points.length] = in_tri[2]; 
	} else {
	    outside_points[outside_points.length] = in_tri[2];
	}
	
	if (inside_points.length === 0) {
	    return;
	} else if (inside_points.length === 3) {
		out_tris.push(in_tri);
	} else if (inside_points.length === 1 && outside_points.length === 2) {
		var out_tri1 = [
		    inside_points[0],
		    vector_IntersectPlane(plane_p, plane_n, inside_points[0], outside_points[0]),
		    vector_IntersectPlane(plane_p, plane_n, inside_points[0], outside_points[1])
		];
		
		out_tris.push(out_tri1);
	} else if (inside_points.length === 2 && outside_points.length === 1) {
		var out_tri1 = [
		    inside_points[0],
		    inside_points[1],
		    vector_IntersectPlane(plane_p, plane_n, inside_points[0], outside_points[0])
		], out_tri2 = [
		    vector_IntersectPlane(plane_p, plane_n, inside_points[1], outside_points[0]),
		    out_tri1[2],
		    inside_points[1]
		];
		
		out_tris.push(out_tri1);
		out_tris.push(out_tri2);
	}
};