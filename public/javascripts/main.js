document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
  console.log(instances);
  const sidebar = instances[0];
  const trigger = document.querySelector('.sidenav-trigger');
  trigger.addEventListener('click', () => {
    sidebar.open();
  });
});
