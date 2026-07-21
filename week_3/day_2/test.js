const arr = [10, 20, 20, 40]
const arr1 = [10, 20, 20, 40, 50]

Array.prototype.mylen = function (i = 0) {
    return (i in this) ? this.mylen(i + 1) : i

}
console.log(arr1.mylen())
