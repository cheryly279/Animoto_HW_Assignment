// BIND AND DEFINE EVENT HANDLERS
//----------------------------------------------------------------------------------------

// add event handler to run when DOM is available, use onreadystatechange for older browsers
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", contentLoadHandler, false);
}
else {
    document.attachEvent("onreadystatechange", contentLoadHandler);
}

// event handler sets up other events we want handled for our form
function contentLoadHandler() { 

    // retrieve form for this page
    var formElement = document.getElementById('animoto-form');

    // call formSubmitHandler when user submits the form
    if (formElement.addEventListener) {
        formElement.addEventListener("submit", formSubmitHandler, false);
    }
    else {
        formElement.attachEvent("onsubmit", function(e) { formSubmitHandler.call( formElement, e ); });
    }


    // set up event handlers to clear validation errors
    var formObj = new FormModel(formElement);

    // loop through inputs, add handlers to clear validation errors when user tries again
    for (var i=0; i < formObj.inputs.length; i++) {
        var inputElem = formObj.inputs[i].inputElement;

        if (inputElem.addEventListener) {
            inputElem.addEventListener("keydown", function(e) { clearValidationHandler.call( formElement, e) }, false);
        }
        else {
            inputElem.attachEvent("onkeydown", function(e) { clearValidationHandler.call( formElement, e ); });
        }
    }

    // placeholder support for older browsers 
    // see if placeholder is supported by creating element and trying to access value
    // don't actually add the element to the page
    var isPlaceholderSupported = (function() {
        var i = document.createElement('input');
        return i.placeholder !== undefined;
    })();

    // if placeholders are not supported in the current browser, perform some error handling to emulate
    if (!isPlaceholderSupported) {

        // get input element for email
        var emailElement = document.getElementById('email');

        // access placeholder value we want to display from html, display in input box
        emailElement.value = emailElement.getAttribute("placeholder");
        emailElement.style.color = "#B0B0B0"; // display placeholder text as gray instead of black

        // when the user clicks in the input box, run function elementFocus (clears placeholder)
        emailElement.attachEvent("onfocus", function(e) { elementFocus.call( emailElement, e ); });

        // after the user enters a character in the input box, run elementKeyUp, which re-adds placeholder as necessary
        emailElement.attachEvent("onkeyup", function(e) { elementKeyUp.call( emailElement, e ); });


        // repeat process for password input element
        var passwordElement = document.getElementById('password');

        passwordElement.value = passwordElement.getAttribute("placeholder");
        passwordElement.style.color = "#B0B0B0";

        passwordElement.attachEvent("onfocus", function(e) { elementFocus.call( passwordElement, e ); });
        passwordElement.attachEvent("onkeyup", function(e) { elementKeyUp.call( passwordElement, e ); });
    }
}

// emulate clearing of placeholder value
function elementFocus(e) {

    // if the current value displayed is the placeholder
    if (this.value == this.getAttribute("placeholder"))
    {
        // now that we have the cursor in the element, clear out the placeholder to make way for input
        this.value = "";
        this.style.color = "#000000"; // go back to black for text value being entered
    }
}

// emulate adding of placeholder value
function elementKeyUp(e) {

    // if the user deleted all text in input element, re-add placeholder
    if (this.value == "") {

        // add placeholder value and styling to input element
        this.value = this.getAttribute("placeholder");
        this.style.color = "#B0B0B0";
        this.blur(); // remove focus (prevents elementFocus from being called again)
    }
}

// runs when form is submitted
function formSubmitHandler(e) {

    // create custom form validator object, defined below
    // also create FormModel object form form html element
    var validator = new AnimotoFormValidator(new FormModel(this));

    // run validation - returns if the form can be submitted
    // also stores any errors in the validator object
    var isFormValid = validator.validate();

    // if validation failed
    if (!isFormValid) {

        // call method to display errors on page
        validator.displayErrors();

        // prevent data being submitted to server
        if (e.preventDefault) { e.preventDefault(); }
        else { e.returnValue = false; }
        return false;
    }
}

// re-hide error messages
function clearValidationHandler(e) {

    var formObj = new FormModel(this);

    var inputElements = formObj.inputs; // get input elements

    // for each input element, get associated error div
    for (var i = 0; i < inputElements.length; i++) {

        // loop through error div's children
        if (inputElements[i].associatedErrorDiv) {
            var errorChildren = inputElements[i].associatedErrorDiv.getElementsByTagName("div");

            for (var j = 0; j < errorChildren.length; j++) {
                errorChildren[j].style.display = "none"; // hide all
            }
        }
    }
}



// MODELS
//----------------------------------------------------------------------------------------

// model class: defines form object and common properties for easy access
function FormModel(formElement) {

    // only property we need for this example is the input elements of the form
    this.inputs = [];

    var inputElements = formElement.getElementsByTagName("input");

    for (var i = 0; i < inputElements.length; i++) {
        this.inputs.push(new InputModel(inputElements[i]));
    }
}


// model class: defines input element of a form, and common properties for easy access
function InputModel(inputElement) {

    // refer back to input element passed in
    this.inputElement = inputElement;

    // get associated error div for this input element
    var currentSiblings = inputElement.parentNode.getElementsByTagName("div");

    // find sibling with single class, "errors" - in our example, the next sibling for the input elements
    for (var j = 0; j < currentSiblings.length; j++) {
        if (currentSiblings[j].className == "errors") {
            this.associatedErrorDiv = currentSiblings[j];
            break;
        }
    }

    // get classes for this input element
    this.inputClasses = inputElement.className.split(" ");

    // get input value
    this.value = inputElement.value;

    // get placeholder
    this.placeHolder = inputElement.getAttribute("placeholder");
}




// VALIDATION CLASS
//----------------------------------------------------------------------------------------

// construct for form validator
function AnimotoFormValidator(formObj) {

    // form to be validated (in form of FormModel)
    this.formToValidate = formObj;

    // stores any errors the validator comes across
    // stored as an array of objects where each object contains a reference to the element being validated and an array of the errors found
    this.validationErrors = [];
}

// custom validator methods
AnimotoFormValidator.prototype = {

    // validate input elements on form
    validate: function () {

        // clear errors from previous validations
        this.validationErrors = [];

        var isValid = true; // store for quick access if form passed/failed validation
        var inputElements = this.formToValidate.inputs; // get input elements

        // for each input element
        for (var i = 0; i < inputElements.length; i++) {

            var elementToValidate = inputElements[i];

            // special case - if text is placeholder, change value being validated to ""
            var inputValue = elementToValidate.value != elementToValidate.placeHolder ? elementToValidate.value : "";

            // look at classes on input element to see what type of validation should be performed
            // for each class name on the current input element
            for (var j = 0; j < elementToValidate.inputClasses.length; j++) {
                var validationType = elementToValidate.inputClasses[j]; // use class name as validation type

                var currentErrors = []; // initialize array that will contain any errors found for this element

                if (validationType.length > 0) {
                    // use class name to see what method to run
                    var methodName = validationType + "Validation";

                    // run appropriate validation method, store errors returned
                    if (this[methodName]) {
                        currentErrors = this[methodName](inputValue);
                    }
                }

                // if an errors were found, store on the object along with reference to input element
                if (currentErrors.length > 0) {
                    this.validationErrors.push({
                        "element" : elementToValidate,
                        "errors" : currentErrors
                    });

                    // at least one error was found, form failed validation
                    isValid = false;
                }
            }
        }
        return isValid; // return if valid so user can get a quick sense of if form passed
    },


    // show any errors stored in object
    displayErrors: function() {

        // for each set of errors
        for (var i = 0; i < this.validationErrors.length; i++) {

            // get element the errors are associated with
            var currentElement = this.validationErrors[i]["element"];

            // get the errors for this element
            var currentErrors = this.validationErrors[i]["errors"];

            // make sure this input element has a sibling div with error messages
            if (currentElement.associatedErrorDiv) {

                // for each error
                for (var k = 0; k < currentErrors.length; k++) {

                    // get children of error div that matches this error
                    var errorChildren = currentElement.associatedErrorDiv.getElementsByTagName("div");

                    // loop over any divs that might be displayed for this error
                    for (var l = 0; l < errorChildren.length; l++) {

                        if (errorChildren[l].className) {

                            var errorChildClasses = errorChildren[l].className.split(" ");

                            // for each child div, display error if class name contains the error encountereds
                            for (var m = 0; m < errorChildClasses.length; m++) {
                                if (errorChildClasses[m] == currentErrors[k]) {
                                    errorChildren[l].style.display = "block";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // validate email values
    emailValidation: function (emailAddress) {
        var errorList = [];
        emailAddress = emailAddress || "";

        // store any possible errors
        if (emailAddress.length == 0) {
            errorList.push('empty'); // user didn't enter anything (email required)
        }
        else {
            // regex for emails
            // see README.txt for further explanation of regex used here
            var email_re = new RegExp(
                "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", 
                "i");
            var email_result = email_re.test(emailAddress);

            if (!email_result) { errorList.push('invalid'); } // email didn't pass regex validation
        }
        return errorList; // return errors found
    },

    // validate password values
    passwordValidation: function (password) {
        var errorList = [];
        password = password || "";

        // store any possible errors
        if (password.length == 0) { errorList.push('empty'); } // user didn't enter anything (password required)
        else {
            if (/\s+/.test(password)) { errorList.push("spaces"); } // whitespace - did user try to enter two words?
            if (!(/[a-z]+/.test(password))) { errorList.push("lower"); } // user didn't include a lowercase letter
            if (!(/[A-Z]+/.test(password))) { errorList.push("upper"); } // user didn't include an uppercase letter
            if (!(/\d+/.test(password))) { errorList.push("digit"); } // user didn't include a number
        }
        return errorList; // return errors found
    }
}
