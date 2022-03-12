let i = 0;

function test() {
  foo('Hello');
}

function foo(str) {
  if (i == 5) {
    console.log('Done');
  } else {
    setTimeout(() => {
      i++;
      console.log(i, str);
      foo(str);
    }, 110);
  }
}

test();
