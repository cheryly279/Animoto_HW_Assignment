AnimotoFormValidator
------------------------------
This example code defines the AnimotoFormValidator class, used for validation of form input.

This class performs email and password validation, but can easily be extended for other forms of validation.
This code expects the following structure in your html form: each <input> element to be validated must have class values that indicate the type of validation to be performed. Note that multiple classes could result in multiple validation being run on the same input.
The class name of the input element appended with the string "Validation" indicates the method of AnimotoFormValidator that will be invoked.
To add other types of validation, continue to use this naming convention in your methods.

As well, errors encountered are stored on the object to be displayed after validation is complete, using method displayErrors.
This code also expects a certain form in the html: that there is a sibling <div> element along with the input elements containing possible error messages. This sibling must have the class name set to "errors" and currently only allows for one class name.
The errors found in the validation process are looped over and the corresponding divs are displayed. The code could be modified without too much effort to instead add/remove the error messages as needed, instead of hidden/displayed. If the "errors" div is not found or it doesn't contain child elements that correspond to the errors discovered, the error in question is simply not displayed.

Note: When the user begins to re-enter data, the application assumes they are trying again and any existing error messages are hidden.



Email Validation Regex
------------------------------
There are quite a lot of different valid email formats, so as far as email validation is concerned, I have heard it suggested that there is error handling on the server side as well - specifically, logging of any error messages if we attempt to send emails to these addresses and some of them fail. I slightly modified a regular expression found at www.regular-expressions.info/email.html. The regex I use is case-insensitive, and allows for various special characters, but it does not allow the email address to start or end with a decimal (.), or have a decimal adjacent to the @ symbol. 



Possible Future Enhancements
------------------------------
1. Modify how event handlers are set up for placeholder (lines 54-74); Perhaps loop over all elements with a placeholder attribute, process elements in a loop?
2. Split AnimotoFormValidator and model classes into their own files, modularize code better to cut down on polluting the global namespace.
3. Add more data checks and/or exception handling. There is checking now for null and undefined values, but not, for instance, that the element being validated is in fact a form.
4. Design a more professional-looking form.
5. Further flesh out the model classes - perhaps make an AnimotoFormValidator a property of the FormModel, by default associated with the form to be called at any time.