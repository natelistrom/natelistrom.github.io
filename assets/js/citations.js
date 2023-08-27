// from https://www.freecodecamp.org/news/how-to-read-json-file-in-javascript/
// and https://stackoverflow.com/questions/45018338/javascript-fetch-api-how-to-save-output-to-variable-as-an-object-not-the-prom
    
let refData = [];
fetch('/assets/json/references.json')
  .then(res => res.json())
  .then(data => {
    refData = data;
   })
  .then(() => {
//    console.log(refData);

        let citations = document.querySelectorAll('cite');
        citations.forEach(function(cite) {
            let c = cite.childNodes[0].textContent;
            let words = c.split("."); // We could do all this with regex, but this is easier to understand
            let cAuthor = words[0].substring(1) + "."; // Strip off the leading '(' character and add a trailing '.'
            let cDate = words[1].substring(1) + "."; // Strip off the leading space and add a trailing '.'
            console.log("Author: " + cAuthor);
            console.log("Date: " + cDate);
        });

   });

/*
    Citation builder

    This script iterates through references and generates a list of citations.
    We check for multiple citations of the same work and, depending on whether they
    are adjacent or not, use either a "short version" with title and author only or
    ibid.

    We do not yet check for multiple works by the same author. Thus, we can't use
    only the author for the "short version." Maybe that'll come one day.
*/

if (document.querySelectorAll('sup:not(.aside)').length > 0) {

    let num_refID = 0; 
    let dom_references = document.querySelectorAll('sup:not(.aside)'); // Get a nodelist of all <sup> items
    let dom_wrapper = document.getElementById('content').firstElementChild;

    dom_wrapper.insertAdjacentHTML("beforeend", "<hr /><h4 id='references'>References</h4><ol id='citations'></ol>");
    
    let dom_footnotes = document.getElementById('citations');

    let arr_refsList = [];

    dom_references.forEach(function(sup) {
    /*
        dom_references reads the list of nodes, but it doesn't actually point back to them.
        So, we need a way to point back to the original superscript elements. We do this by
        assigning each of them a unique ID. 
        
        Handily, we can also use this as the ID to which our footer reference back links point.
        */

    num_refID = num_refID + 1;
    sup.setAttribute("id","ref" + num_refID); // Set <sup id="n"> 

    let str_refContent = "";
    if(sup.querySelector('.refBody')) {
        str_refContent = sup.querySelector('.refBody').innerHTML;
    }; 

    // Capture the short title.
    let str_refTitle = "No title";
    if (sup.querySelector('.refTitleShort')) {
        str_refTitle = sup.querySelector('.refTitleShort').innerHTML;
    };

    // Capture the short author.
    let str_refAuthor = "No author";
    if (sup.querySelector('.refAuthorShort')) {
        str_refAuthor = sup.querySelector('.refAuthorShort').innerHTML; 
    };

    // Capture the page number or location if one exists.
    let str_refLocation = "";
    if (sup.childNodes[2]) {
        str_refLocation = sup.childNodes[2].textContent;
    }; 

    str_refContent = str_refContent + " " + str_refLocation;

    arr_refsList.push([str_refContent, str_refTitle, str_refLocation, str_refAuthor]);

    // Replace the content of the <sup> item
    var dom_supItem = document.getElementById("ref" + num_refID + "");
    dom_supItem.innerHTML = "<a href='#" + num_refID +"'>" + num_refID + "</a>";
    }); // end forEach

    /*
    Loop through the array and change repeat references to short versions.
    Conditionally show titles on short versions if multiple works by the same author.
    */
    for (let y = 0; y < arr_refsList.length; y++) {
        let str_currentTitle = arr_refsList[y][1];
        let str_currentLocation = arr_refsList[y][2];
        let str_currentAuthor = arr_refsList[y][3];

        // Check to see that this is not the first time a work has been cited.
        let num_firstReferenceIndex = undefined;  
        num_firstReferenceIndex = arr_refsList.findIndex(element => element[1] == str_currentTitle);
        if (num_firstReferenceIndex != y) {

            // The entire array is populated at this point.
            // We are currently at one of the items in the array . . .
            // Check the current author and create a new array of any matching items that also share that author.
            let arr_matchingAuthor = arr_refsList.filter(element => element[3] == str_currentAuthor);

            let str_titleMismatchFound = true;

            // Search the array of matching author's items to see if any of them have a different title.
            str_titleMismatchFound = arr_matchingAuthor.some(element => element[1] != str_currentTitle);

            if(str_titleMismatchFound == true) {
            arr_refsList[y][0] = str_currentAuthor + " " + str_currentTitle + " " + str_currentLocation;
            } else {
            arr_refsList[y][0] = str_currentAuthor + " " + str_currentLocation;
            }; // end if

        }; // end if
    }; // end for

    /*
        Loop backward over the array.
        If the titles are the same in two sequential items, change the second item to ibid.
        */
    for (let i = arr_refsList.length - 1; i >= 0; i--) {

        let str_currentTitle = arr_refsList[i][1];
        let str_prevTitle = "No title";

        let str_currentLocation = arr_refsList[i][2];
        let str_prevLocation = "No location";

        if (i > 0) {
            str_prevTitle = arr_refsList[i - 1][1];
            str_prevLocation = arr_refsList[i - 1][2];
        };

        if (str_currentTitle === str_prevTitle) {
            if (str_currentLocation === str_prevLocation) {
            arr_refsList[i][0] = "Ibid.";
            } else {
            arr_refsList[i][0] = "Ibid. " + arr_refsList[i][2];
            };
        };

    }; // end for

    // Create the references list HTML.
    for (let j = 0; j < arr_refsList.length; j++) {
        num_refID = j + 1;
        str_refContent = arr_refsList[j][0];
        dom_footnotes.insertAdjacentHTML("beforeend", "<li>" + str_refContent + " <a id='" + num_refID + "' href='#ref" + num_refID + "'>Back</a></li>");
    }; // end for

}; // end if