const DONE = 'done';
const WORKING = 'working';
const UNDONE = 'undone';

const toggle = {
  [DONE]: UNDONE,
  [UNDONE]: WORKING,
  [WORKING]: DONE
};

const getDefault = () => UNDONE;

const toggleStatus = function(currentStatus) {
  return toggle[currentStatus];
};

module.exports = {toggleStatus, getDefault};
