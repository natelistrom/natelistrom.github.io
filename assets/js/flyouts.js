if (document.querySelectorAll('.flyoutTrigger').length > 0) {

    /*
      Flyout positioning script adapted from that of Vincent Navetat.
      https://medium.com/carwow-product-engineering/building-a-simple-tooltip-component-that-never-goes-off-screen-c7039dcab5f9
      */

    function positionFlyout(trigger, flyout) {

        const screenPadding = 15;

        const placeholderRect = trigger.getBoundingClientRect();
        const dropdownRect = flyout.getBoundingClientRect();

        const dropdownRightX = dropdownRect.x + dropdownRect.width;
        const placeholderRightX = placeholderRect.x + placeholderRect.width;

        if (dropdownRect.x < 0) {
            flyout.style.left = '0';
            flyout.style.right = 'auto';
            flyout.style.transform = `translateX(${-placeholderRect.x + screenPadding}px)`;
        } else if (dropdownRightX > window.outerWidth) {
            flyout.style.left = 'auto';
            flyout.style.right = '0';
            flyout.style.transform = `translateX(${(window.outerWidth - placeholderRightX) - screenPadding}px)`;
        }
    };

    let dom_flyoutTriggers = document.getElementsByClassName("flyoutTrigger");

    // for each flyout trigger . . .
    // when it is clicked, look for the next element that has the class name flyout . . .
    // check to see if that also has the .active class
    // if it does, remove the class
    // if it doesn't add the class

    for (let i = 0; i < dom_flyoutTriggers.length; i++) {
    let dom_trigger = dom_flyoutTriggers[i];

        dom_trigger.addEventListener("click", function() {
            let dom_flyout = dom_trigger.nextElementSibling;

            if (dom_flyout.classList.contains("active")) {
            dom_flyout.classList.remove("active");
            } else {
            positionFlyout(this, dom_flyout);
            dom_flyout.classList.add("active");
            };

        });
    };

    document.addEventListener("click", function(event) {
    let currentTooltip = null;

        if (currentTooltip = event.target.closest(".flyoutRoot")) {
            currentTooltip = event.target.closest(".flyoutRoot").children[1];
        };

        document.querySelectorAll('.active').forEach(tooltip => {
            if (tooltip === currentTooltip) return;

            tooltip.classList.remove('active');
        });
    });

};