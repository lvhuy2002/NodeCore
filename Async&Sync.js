
// To understand the code flow in Node.js, we have some core concepts: 
// 1. Call stack -> this is where all synchronous code is executed 
// 2. process.nextTick() -> after execute all synchronous code, 
// asynchronous will be executed, process.nextTick() is highest priority asynchronous code.
// 3. MicroTask (include then(), catch(), finally() in Promise, queueMicrotask(), await (async function)) is next priority.
// 4. MacroTask (include setTimeOut, setInterval, setImmediate, I/O, network callback, database query) is lowest priority.

// Based on the core concepts above, we will read and analyze Node.js code as follows:
// 1. Run all call stack in level 1

// 2. Travel all source code to run call stack in level 1 and 
// then push_back all nextTick, microTask, macroTask to nextTick queue, microTask queue, macroTask queue

// 3. Check nextTick queue, run all nextTick(), travel all source code in nextTick() callback 
// to run call stack and then save all nextTick, microTask, macroTask 
// to nextTick queue, microTask queue, macroTask queue

// 4. Repeat the step 3 until the nextTick queue is empty. 
// Travel all source code in each nextTick() callback to run call stack 
// and then save all nextTick, microTask, macroTask to nextTick queue, microTask queue, macroTask queue

// 5. Check microTask queue, run all microTask queue, 
// Travel all source code in each microTask callback to run call stack 
// and then save all nextTick, microTask, macroTask to nextTick queue, microTask queue, macroTask queue

// 6. Repeat step 4 and step 5 until the nextTick queue and microTask queue empty.
// Travel all source code in each macroTask callback to run call stack
// and then save all nextTick, microTask, macroTask to nextTick queue, microTask queue, macroTask queue

// 7. Repeat step 4, step 5 and step 6 until all queue empty.

// To understand please run example below:


// nextTick  Queue = []
// microTask Queue = []
// macroTask Queue = []
console.log("callstack1"); // console.log("callstack1") -> callstack -> execute -> remove

// nextTick  Queue = []
// microTask Queue = []
// macroTask Queue = [setTimeOut1]
setTimeout(() => console.log("setTimeOut1"), 0);


// nextTick  Queue = []
// microTask Queue = [promise1]
// macroTask Queue = [setTimeOut1]
Promise.resolve().then(() => {
  console.log("promise1");

  process.nextTick(() => {
    console.log("nextTick5");

    process.nextTick(() => {
      console.log("nextTick7");
    });
  });
});


// nextTick  Queue = [nextTick1]
// microTask Queue = [promise1]
// macroTask Queue = [setTimeOut1]
process.nextTick(() => {
  console.log("nextTick1");

  process.nextTick(() => {
    console.log("nextTick3");

    setTimeout(() => {
        console.log("setTimeOut2")
    
        process.nextTick(() => {
            console.log("nextTick8");
        })
    
    }, 0);

    Promise.resolve().then(() => {
        console.log("promise2");

        process.nextTick(() => {
            console.log("nextTick6");

            Promise.resolve().then(() => {
                console.log("promise3");

            });
        });
    });
  });
});

// nextTick  Queue = [nextTick1, nextTick2]
// microTask Queue = [promise1]
// macroTask Queue = [setTimeOut1]
process.nextTick(() => {
  console.log("nextTick2");

  process.nextTick(() => {
    console.log("nextTick4");
  });
});

// nextTick  Queue = [nextTick1, nextTick2]
// microTask Queue = [promise1]
// macroTask Queue = [setTimeOut1] 
console.log("callstack2"); // console.log("callstack2") -> callstack -> execute -> remove

// nextTick  Queue = [nextTick1, nextTick2] -> remove and call nextTick1 -> console.log("nextTick1") -> callstack -> execute -> remove and add nextTick3
// microTask Queue = [promise1]
// macroTask Queue = [setTimeOut1]

// nextTick  Queue = [nextTick2, nextTick3] -> remove and call nextTick2 -> console.log("nextTick2") -> callstack -> execute -> remove and add nextTick4
// microTask Queue = [promise1]
// macroTask Queue = [setTimeOut1] 

// nextTick  Queue = [nextTick3, nextTick4] -> remove and call nextTick3 -> console.log("nextTick3") -> callstack -> execute -> remove and add setTimeout2, promise2.
// microTask Queue = [promise1, promise2]
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = [nextTick4] -> remove and call nextTick4 -> console.log("nextTick4") -> callstack -> execute -> remove
// microTask Queue = [promise1, promise2]
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = [] 
// microTask Queue = [promise1, promise2] -> remove and call promise1 -> console.log("promise1") -> callstack -> execute -> remove and add nextTick5
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = [nextTick5] 
// microTask Queue = [promise2] -> remove and call promise2 -> console.log("promise2") -> callstack -> execute -> remove and add nextTick6
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = [nextTick5, nextTick6] -> remove and call nextTick5 -> console.log("nextTick5") -> callstack -> execute -> remove and add nextTick7
// microTask Queue = [] 
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = [nextTick6, nextTick7] -> remove and call nextTick6 -> console.log("nextTick6") -> callstack -> execute -> remove and add promise3
// microTask Queue = [] 
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = [nextTick7] -> remove and call nextTick7 -> console.log("nextTick7") -> callstack -> execute -> remove
// microTask Queue = [promise3] 
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = []
// microTask Queue = [promise3] -> remove and call promise3 -> console.log("promise3") -> callstack -> execute -> remove
// macroTask Queue = [setTimeOut1, setTimeout2] 

// nextTick  Queue = []
// microTask Queue = [] 
// macroTask Queue = [setTimeOut1, setTimeout2] -> remove and call setTimeOut1 -> console.log("setTimeOut1") -> callstack -> execute -> remove


// nextTick  Queue = []
// microTask Queue = [] 
// macroTask Queue = [setTimeout2] -> remove and call setTimeOut2 -> console.log("setTimeOut2") -> callstack -> execute -> remove and add nextTick8

// nextTick  Queue = [nextTick8] -> remove and call nextTick8 -> console.log("nextTick8") -> callstack -> execute -> remove
// microTask Queue = [] 
// macroTask Queue = [] 
