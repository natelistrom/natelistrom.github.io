/*
    Citation builder

    This script iterates through references and generates a list of citations.
    We check for multiple citations of the same work and, depending on whether they
    are adjacent or not, use either a "short version" with title and author only or
    ibid.

    We do not yet check for multiple works by the same author. Thus, we can't use
    only the author for the "short version." Maybe that'll come one day.
*/

if (document.querySelectorAll('cite').length > 0) {

    let num_refID = 0; 
    let dom_references = document.querySelectorAll('cite'); // Get a nodelist of all <cite> items
    let dom_wrapper = document.getElementById('content').firstElementChild;

    dom_wrapper.insertAdjacentHTML("beforeend", "<hr /><h4 id='references'>References</h4><ol id='citations'></ol>");
    
    let dom_footnotes = document.getElementById('citations');

    let arr_refsList = [];

    /*  fetch json data
    from https://www.freecodecamp.org/news/how-to-read-json-file-in-javascript/
    and https://stackoverflow.com/questions/45018338/javascript-fetch-api-how-to-save-output-to-variable-as-an-object-not-the-prom */ 
    let refData = [];
    fetch('/assets/json/references.json')
        .then(res => res.json())
        .then(data => {
            refData = data;
        })
        .then(() => {

            dom_references.forEach(function(cite) {
                let c = cite.innerText; // innerText to avoid having to deal with markup (aka links, etc.)
                let cElements = c.split(','); // Split on every comma. We could do this with regex instead, but this is easier to understand.
                let cID = "";
                let cLoc = "";

                // TO DO: need to figure out a new way to do the matching. 
                // The titles with italics and the periods within quotes create too much variance.
                // Better to store the raw data in the json without html and then add it as needed in the js as we build the strings to render.

                /*  To identify a match between the citation and the corresponding data in the json, we must follow the same format exactly.
                
                    Expected in-page citation patterns are:
                    '(String'                   Author w/ Loc   <== Remove leading '(' and add trailing '.'
                    '(&ldquo;String&rdquo;'     Title w/ Loc    <== Remove leading '('
                    '(String)'                  Author alone    <== Remove leading '(' and trailing ')' and add trailing '.'
                    '(&ldquo;String&rdquo;)'    Title alone     <== Remove leading '(' and trailing ')'
                    ' String)'                  Loc             <== Remove leading space and trailing ')' and add trailing '.'
                */

                // Check to see if this is a title in quotes or not.
                // If so, we need to apply special logic to ensure matching works because the period is inside the quotes.
                let cElement1 = cElements[0].substring(1); // Remove leading '(' character
                let cElement2 = "";
                let lastChar = cElement1.slice(-1);
                if (cElements[1]) { 
                    cElement2 = cElements[1].substring(1);  // Remove leading space 
                };

                // Browser page render automatically converts the HTML double quote entities to characters.
                // For matching, we need to convert the quote characters back to HTML entities.
                function escape(htmlStr) {
                    htmlStr = htmlStr
                        .replace("“", "&ldquo;")
                        .replace("”", "&rdquo;");
                    return htmlStr;
                };
                if (cElement1.includes("“")) { 
                    cElement1 = escape(cElement1); 
                };

                // Update strings to match patterns.
                if (lastChar == ")") { 
                    cID = cElement1.substring(0, cElement1.length - 1); // Title or author without location. Remove trailing ')'
                    if (cID.slice(-1) != ";") { cID = cID + "."; }; // Title. Add trailing '.'
                } else if (lastChar == ";") {
                    cID = cElement1; // Title.
                    cLoc = cElement2.substring(0, cElement2.length - 1) + "."; // Remove trailing ')' and add '.'
                } else {
                    cID = cElement1 + "."; // Author. Add a trailing '.'
                    cLoc = cElement2.substring(0, cElement2.length - 1) + "."; // Remove trailing ')' and add '.'
                }; // end if 

                /*
                dom_references reads the list of nodes, but it doesn't actually point back to them.
                So, we need a way to point back to the original superscript elements. We do this by
                assigning each of them a unique ID. 
                
                Handily, we can also use this as the ID to which our footer reference back links point.
                */

                num_refID = num_refID + 1;
                cite.setAttribute("id","ref" + num_refID); // Set <cite id="n">

                for (let d = 0; d < refData.length; d++) {
                    let m = refData[d];
                    if (cID == m.authorShort || cID == m.titleShort) {

                        // Add link to title if one exists
                        if (m.titleLink != null) {
                            m.title = "<a href='" + m.titleLink + "'>" + m.title + "</a>";
                        }

                        let str_refContent = m.author + " " + m.title + " " + m.body + " " + cLoc;
                    
                        arr_refsList.push([str_refContent, m.titleShort, cLoc, m.authorShort]);

                    };
                }; // end for
            
                // Replace the content of the <cite> item
                var dom_citeItem = document.getElementById("ref" + num_refID + "");
                dom_citeItem.innerHTML = "<sup><a href='#" + num_refID +"'>" + num_refID + "</a></sup>";
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

    }); // end fetch then

}; // end if