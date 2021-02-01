import x from '../images/avatar/x.jpg';

const imgList = ['x.jpg'];

const picList = [x];

const personArray = [];
for (let i = 0; i < imgList.length; i += 1) {
  let person = {
    id: i,
    name: imgList[i].slice(0, -4),
    image: picList[i],
    hash: '',
  };
  personArray.push(person);
}

const personMap = personArray.reduce((prev, curr) => {
  prev[curr.name] = curr;
  return prev;
}, {});

export { personMap };
export default personArray;
