import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useReducer,
  memo,
  useRef,
} from "react";

//  useState

//jo hamre pas ismple variable hai woh memory pai toh updatee hor haa hai but actually mai 
// screen pai show nahi jor aha hai jis ki wjah se humne use kiya hai usestate
function WithoutUseState() {
  let cars = 0;

  function handleClick() {
    cars++;
    console.log("cars in memory:", cars, "screen still shows 0");
  }

  return (
    <>
      <p>{cars}</p>
      <button onClick={handleClick}>add</button>
    </>
  );
}

// ab yahan par agar hum dkehen to usestate kis jah se jab bhi setcar ka function call hota hai toh hum isko 
// screen oai dkeh sakte ahi bcz yeh re render hota hai evrytime
function WithUseState() {
  const [cars, setCars] = useState(0);

  console.log("re-rendered, cars:", cars);

  return (
    <>
      <p>{cars}</p>
      <button onClick={() => setCars(cars + 1)}>add</button>
    </>
  );
}


//  useEffect


// kyun k yeh react keh normal flow se bahir hai and react cant conrtol the timing and har render par yeh intervel chalta hai and a new timer is made 
// or purany intervel ko khtm nahi karta jiss ki wajah se yeh infinite loop mein chla jata hai or brower hang ho jata hai 
function WithoutUseEffect() {
  const [s, setS] = useState(0);


  // setInterval(() => setS(s => s + 1), 1000);

  console.log("render", s + 1, " another one just started");

  return <p>broken timer (see console)</p>;
}

// ab yahan useeffect ki wajah se yeh only sirf aik dafa render hoga or na hi infinite loop mein jayega bcz we can contol it using deprandcy array which allows it to only run once after mount
function WithUseEffect() {
  const [s, setS] = useState(0);

  useEffect(() => {
    console.log("interval started — only happens once");
    const id = setInterval(() => setS(s => s + 1), 1000);
    return () => {
      console.log("interval cleared — component removed");
      clearInterval(id);
    };
  }, []);

  return <p>timer: {s}s</p>;
}

//  useLayoutEffect

// gar hum useeffect ko use krte ahi toh pehle uski default value show hoti hai or bad mai uski actual value show hoti hai jiss ki wajah se user ko flicker show hota hai jiski wjah se ui flickering ka masla ata hai

function WithoutUseLayoutEffect() {
  const [label, setLabel] = useState("checking...");
  const ref = useRef(null);

  useEffect(() => {
    const w = ref.current.offsetWidth;
    console.log("label", w);
    setLabel(w > 300 ? "WIDE box" : "NARROW box");
  }, []);

  return (
    <div ref={ref} style={{ border: "1px solid gray", padding: "8px" }}>
      {label}
    </div>
  );
}

// yahan pehle actual value show hoti hai jiss ki wajah se user ko flicker nahi hota
function WithUseLayoutEffect() {
  const [label, setLabel] = useState("checking...");
  const ref = useRef(null);

  useLayoutEffect(() => {
    const w = ref.current.offsetWidth;
    console.log("label ", w);
    setLabel(w > 300 ? "WIDE box" : "NARROW box");
  }, []);

  return (
    <div ref={ref} style={{ border: "1px solid gray", padding: "8px" }}>
      {label}
    </div>
  );
}


//  useMemo

function heavyWork(n) {
  console.log("running heavy work with:", n);
  for (let i = 0; i < 1e7; i++) { }
  return n * 2;
}

//use memo ka main maqsad hai -> koi bhi heavy function or calculation ka result memovalue mai store karna
//take har render pai unneceesary changes pai bhi run hone ki bajye sirf jab neccesary ho tab run kare
function WithoutUseMemo() {
  const [number, setNumber] = useState(1);
  const [theme, setTheme] = useState("light");

  const result = heavyWork(number);  // har render par chlega 

  return (
    <>
      <p>result: {result} | theme: {theme}</p>
      <button onClick={() => setNumber(n => n + 1)}>change number</button>
      <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>toggle theme</button>
      <small>(watch console — heavy work runs on theme toggle too)</small>
    </>
  );
}

// ab use memo ki wjah se we are saved the unnecesary calls of a heavy calcilation

function WithUseMemo() {
  const [number, setNumber] = useState(1);
  const [theme, setTheme] = useState("light");

  const result = useMemo(() => heavyWork(number), [number]);

  return (
    <>
      <p>result: {result} | theme: {theme}</p>
      <button onClick={() => setNumber(n => n + 1)}>change number</button>
      <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>toggle theme</button>
      <small>(watch console — heavy work is skipped on theme toggle)</small>
    </>
  );
}

//  useCallback


// this  a child that ha its own prop and should only render whne that prop changes

const ChildButton = memo(function ChildButton({ onClick }) {
  console.log("child rendered");
  return <button onClick={onClick}>child button</button>;
});

// ab withoutcallback jab jab bhi parent component re render hoga toh child component bhi re render hoga bcz handleClick is a new function object every time 
function WithoutUseCallback() {
  const [count, setCount] = useState(0);

  const handleClick = () => setCount(c => c + 1);

  console.log("parent rendered, count:", count, "— child will also render");

  return (
    <>
      <p>count: {count}</p>
      <ChildButton onClick={handleClick} />
      <small>(watch console — child logs on every parent render)</small>
    </>
  );
}

// lekin yahn usecallback ki help se jab parent componet re render hoga toh child component re render nahi hoga bcz handleClick is a memoized function object 
function WithUseCallback() {
  const [count, setCount] = useState(0);
  const [extra, setExtra] = useState(0);

  const handleClick = useCallback(() => setCount(c => c + 1), []);

  console.log("parent rendered, count:", count, "extra:", extra);

  return (
    <>
      <p>count: {count} | extra: {extra}</p>
      <ChildButton onClick={handleClick} />
      <button onClick={() => setExtra(e => e + 1)}>change extra</button>
      <small>(watch console — child does not log when extra changes)</small>
    </>
  );
}


//  React.memo


// without react.memo -> agr prop mai koi change nah bhi aya huwa ho tab bhi yeh re render hoga
function UserProfileNoMemo({ username }) {
  console.log("UserProfileNoMemo rendered, username:", username, "— props didn't change, still ran");
  return <p> {username}</p>;
}

function ChatRoomNoMemo() {
  const [message, setMessage] = useState("");
  return (
    <>
      <UserProfileNoMemo username="usman" />
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="type a message..."
      />

    </>
  );
}

// with memo -> agr prop change hoga tab hi re render hoga and react.memo prevents the re render and it does shallow checking
const UserProfileWithMemo = memo(function UserProfileWithMemo({ username }) {
  console.log("UserProfileWithMemo rendered, username:", username, "— only runs when username actually changes");
  return <p> {username}</p>;
});

function ChatRoomWithMemo() {
  const [message, setMessage] = useState("");
  return (
    <>
      <UserProfileWithMemo username="usman" />
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="type a message..."
      />

    </>
  );
}

//  useReducer


// without useReducer -> jo bhi hamre multiple usestates woh scatterd hoti hain and unko manage karna mushkil hota hai

function WithoutUseReducer() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState(0);

  function deposit() {
    console.log("depositing 50. balance will be:", balance + 50);
    setBalance(balance + 50);

    setTransactions(transactions + 1);
  }

  return (
    <>
      <p>balance: ${balance} | transactions: {transactions}</p>
      <button onClick={deposit}>deposit $50</button>
    </>
  );
}

// iska logic same hota hai but iska syntax thora difference hai  yh ek reducer function use karta hai or usko hum initial state dete hain or yh ek jaga hai jhan hamare multiple usestates ko combine kar sakte hain
//  and hum certain rules follow karte hain ki kis tarah hum state ko update karenge 


function bankReducer(state, action) {
  console.log("action:", action.type, "| state before:", state);
  switch (action.type) {
    case "deposit": return { balance: state.balance + 50, transactions: state.transactions + 1 };
    case "withdraw": return { balance: state.balance - 50, transactions: state.transactions + 1 };
    case "reset": return { balance: 0, transactions: 0 };
    default: return state;
  }
}


function WithUseReducer() {
  const [state, dispatch] = useReducer(bankReducer, { balance: 0, transactions: 0 });

  console.log("rendered, state:", state);

  return (
    <>
      <p>balance: ${state.balance} | transactions: {state.transactions}</p>
      <button onClick={() => dispatch({ type: "deposit" })}>deposit $50</button>
      <button onClick={() => dispatch({ type: "withdraw" })}>withdraw $50</button>
      <button onClick={() => dispatch({ type: "reset" })}>reset</button>

    </>
  );
}


//  Lifting State Up


// without lifting state -> Sibling1 ke andar data hai, Sibling2 use nahi kar sakta
function Sibling1Broken() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const result = await res.json();
    console.log("post fetched inside Sibling1:", result.title);
    setData(result);
  };

  return <button onClick={fetchData}>Fetch Post</button>;
}

function Sibling2Broken() {

  return <p>No data yet.</p>;
}

function ParentWithoutLifting() {
  return (
    <>
      <Sibling1Broken />
      <Sibling2Broken />
    </>
  );
}

// with lifting state -> Parent state rakhega aur dono siblings mein pass karega
function Sibling1Working({ onSend }) {
  const fetchData = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const result = await res.json();
    console.log("post fetched, sending to parent:", result.title);
    onSend(result);
  };

  return <button onClick={fetchData}>Fetch Post</button>;
}

function Sibling2Working({ data }) {
  if (!data) return <p>No data yet.</p>;
  return <p><b>{data.title}</b></p>;
}

function ParentWithLifting() {
  const [data, setData] = useState(null);

  return (
    <>
      <Sibling1Working onSend={setData} />
      <Sibling2Working data={data} />
    </>
  );
}

export default function App() {
  return (
    <div style={{ padding: "1rem", fontFamily: "monospace" }}>

      <h3>useState</h3>
      <p><b>without:</b></p> <WithoutUseState />
      <p><b>with:</b></p>    <WithUseState />
      <hr />

      <h3>useEffect</h3>
      <p><b>without:</b></p> <WithoutUseEffect />
      <p><b>with:</b></p>    <WithUseEffect />
      <hr />

      <h3>useLayoutEffect — box label (WIDE / NARROW)</h3>
      <p><b>without:</b></p> <WithoutUseLayoutEffect />
      <p><b>with:</b></p>    <WithUseLayoutEffect />
      <hr />

      <h3>useMemo</h3>
      <p><b>without:</b></p> <WithoutUseMemo />
      <p><b>with:</b></p>    <WithUseMemo />
      <hr />

      <h3>useCallback</h3>
      <p><b>without:</b></p> <WithoutUseCallback />
      <p><b>with:</b></p>    <WithUseCallback />
      <hr />

      <h3>React.memo — chat profile</h3>
      <p><b>without:</b></p> <ChatRoomNoMemo />
      <p><b>with:</b></p>    <ChatRoomWithMemo />
      <hr />

      <h3>useReducer — bank account</h3>
      <p><b>without:</b></p> <WithoutUseReducer />
      <p><b>with:</b></p>    <WithUseReducer />
      <hr />

      <h3>Lifting State Up — sharing fetched data</h3>
      <p><b>without:</b></p> <ParentWithoutLifting />
      <p><b>with:</b></p>    <ParentWithLifting />

    </div>
  );
}
