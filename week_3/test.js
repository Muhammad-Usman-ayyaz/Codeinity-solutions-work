import { useState, useMemo, useCallback, useReducer, useEffect, useLayoutEffect, useRef, memo } from "react";

function TestUseMemo() {
    const [count, setCount] = useState(0);
    const doubled = useMemo(() => {
        console.log("computing doubled");
        return count * 2;
    }, [count]);

    console.log("doubled =", doubled);
    return <button onClick={() => setCount(count + 1)}>count: {count}</button>;
}


function TestUseCallback() {
    const [count, setCount] = useState(0);
    const increment = useCallback(() => {
        console.log("increment called");
        setCount(c => c + 1);
    }, []);

    console.log("count =", count);
    return <button onClick={increment}>count: {count}</button>;
}


const TestChild = memo(function TestChild({ name }) {
    console.log("TestChild rendered with", name);
    return <p>{name}</p>;
});

function TestReactMemo() {
    const [count, setCount] = useState(0);
    console.log("parent rendered, count =", count);
    return (
        <div>
            <button onClick={() => setCount(count + 1)}>count: {count}</button>
            <TestChild name="fixed" />
        </div>
    );
}


function testReducer(state, action) {
    switch (action.type) {
        case "increment": return { count: state.count + 1 };
        case "decrement": return { count: state.count - 1 };
        default: return state;
    }
}

function TestUseReducer() {
    const [state, dispatch] = useReducer(testReducer, { count: 0 });
    console.log("test_useReducer: count =", state.count);
    return (
        <div>
            <button onClick={() => dispatch({ type: "decrement" })}>-</button>
            <span> {state.count} </span>
            <button onClick={() => dispatch({ type: "increment" })}>+</button>
        </div>
    );
}





function Sibling1({ onSend }) {
    const fetchData = async () => {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
        const data = await res.json();
        onSend(data);
    };

    return <button onClick={fetchData}>Fetch Post</button>;
}


function Sibling2({ data }) {
    if (!data) return <p>No data yet.</p>;
    return <p><b>{data.title}</b></p>;
}

export default function Parent() {
    const [data, setData] = useState(null);

    return (
        <div>
            <Sibling1 onSend={setData} />
            <Sibling2 data={data} />
        </div>
    );
}




function testAutoMeasuringBox() {
    const boxRef = useRef(null);
    const [boxWidth, setBoxWidth] = useState(0);
    useLayoutEffect(() => {
        if (boxRef.current) {
            const currentWidth = boxRef.current.getBoundingClientRect().width;
            setBoxWidth(currentWidth);
        }
    }, []);

    return (
        <div style={{ padding: '20px' }}>

            <div
                ref={boxRef}
                style={{ display: 'inline-block', background: '#e0e0e0', padding: '15px' }}
            >
                My content dictates my exact  width.
            </div>

            <p style={{ marginTop: '10px' }}>
                The gray box above is exactly <strong>{boxWidth}px</strong> wide.
            </p>
        </div>
    );
}

function test2() {

    const [num, setNum] = useState(0);


    useEffect(() => {
        console.log("num = ", num);

    }, [num])
    return (
        <div>
            <p>Number: {num}</p>
            <button onClick={() => setNum(num + 1)}>Increment</button>
        </div>
    )
}

