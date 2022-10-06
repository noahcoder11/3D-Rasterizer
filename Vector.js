class Vector {
    constructor(x, y, z, w){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w || 1;
    }

    dot(vec){
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    cross(vec){
        return new Vector(
            this.y * vec.z - this.z * vec.y,
            this.z * vec.x - this.x * vec.z,
            this.x * vec.y - this.y * vec.x
        )
    }

    add(vec){
        return new Vector(this.x+vec.x, this.y+vec.y, this.z+vec.z)
    }

    sub(vec){
        return new Vector(this.x-vec.x, this.y-vec.y, this.z-vec.z)
    }

    normalize(){
        var m = Math.sqrt(this.x*this.x + this.y*this.y + this.z * this.z)

        return new Vector(this.x/m, this.y/m, this.z/m)
    }

    scale(scaleX, scaleY, scaleZ){
        return new Vector(this.x * scaleX, this.y * (scaleY || scaleX), this.z * (scaleZ || scaleX))
    }

    rotateX(theta){
        return new Vector(
            this.x,
            this.y * Math.cos(theta) - this.z * Math.sin(theta),
            this.y * Math.sin(theta) + this.z * Math.cos(theta)
        )
    }

    rotateY(theta){
        return new Vector(
            this.x * Math.cos(theta) + this.z * Math.sin(theta),
            this.y,
            this.x * -Math.sin(theta) + this.z * Math.cos(theta)
        )
    }

    rotateZ(theta){
        return new Vector(
            this.x * Math.cos(theta) - this.y * Math.sin(theta),
            this.x * Math.sin(theta) + this.y * Math.cos(theta),
            this.z
        )
    }

    matrixMult(m, w){
        return {
            x: this.x * mat[0][0] + this.y * mat[1][0] + this.z * mat[2][0] + w * mat[3][0],
            y: this.x * mat[0][1] + this.y * mat[1][1] + this.z * mat[2][1] + w * mat[3][1],
            z: this.x * mat[0][2] + this.y * mat[1][2] + this.z * mat[2][2] + w * mat[3][2],
            w: this.x * mat[0][3] + this.y * mat[1][3] + this.z * mat[2][3] + w * mat[3][3],
        }
    }
};
