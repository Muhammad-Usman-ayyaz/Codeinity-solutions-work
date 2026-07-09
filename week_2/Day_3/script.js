arr = [1, [2, 3, 4, [11, 12, 13]], [5, 7], 9, 10];
newarray = [];

function singlearray(arr) {
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index]
        if (element instanceof Array) {
            singlearray(element)
        } else {
            newarray.push(element)
        }

    }

}
singlearray(arr)
console.log(newarray)
