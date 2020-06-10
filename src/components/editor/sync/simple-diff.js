import lodashIsEqual from "lodash.isequal";

export default function simpleDiff(a, b) {
  let left = 0;
  let right = 0;
  while (
    left < a.length &&
    left < b.length &&
    lodashIsEqual(a[left], b[left])
  ) {
    left++;
  }
  if (left !== a.length || left !== b.length) {
    while (
      right + left < a.length &&
      right + left < b.length &&
      lodashIsEqual(a[a.length - right - 1], b[b.length - right - 1])
    ) {
      right++;
    }
  }
  return {
    index: left,
    remove: a.length - left - right,
    insert: b.slice(left, b.length - right),
  };
}
