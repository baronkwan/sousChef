'use strict';

var AlexaSkill = require('./AlexaSkill'),
    // recipes = require('./recipes');

var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';


var sousChef = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
sousChef.prototype = Object.create(AlexaSkill.prototype);
sousChef.prototype.constructor = sousChef;

sousChef.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to Amazon Alexa sousChef, you can tell me what ingredients you have in your refrigerator, and I'll give you a recipe. Keep in mind I can only store three ingredients";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

sousChef.prototype.intentHandlers = {
    // Custom Intent
    "IngredientIntent": function (intent, session, response) { 
        var ingredients = [];
        
    },
    "RecipeIntent": function (intent, session, response) {
        // Find by ingredient API => return the id of the dish
        // getAnlyzedRecipeInstruction API => return JSON we need to parse it
    },

    // "RecipeIntent": function (intent, session, response) {
    //     var itemSlot = intent.slots.Item,
    //         itemName;
    //     if (itemSlot && itemSlot.value){
    //         itemName = itemSlot.value.toLowerCase();
    //     }

    //     var cardTitle = "Recipe for " + itemName,
    //         recipe = recipes[itemName],
    //         speechOutput,
    //         repromptOutput;
    //     if (recipe) {
    //         speechOutput = {
    //             speech: recipe,
    //             type: AlexaSkill.speechOutputType.PLAIN_TEXT
    //         };
    //         response.tellWithCard(speechOutput, cardTitle, recipe);
    //     } else {
    //         var speech;
    //         if (itemName) {
    //             speech = "I'm sorry, I currently do not know the recipe for " + itemName + ". What else can I help with?";
    //         } else {
    //             speech = "I'm sorry, I currently do not know that recipe. What else can I help with?";
    //         }
    //         speechOutput = {
    //             speech: speech,
    //             type: AlexaSkill.speechOutputType.PLAIN_TEXT
    //         };
    //         repromptOutput = {
    //             speech: "What else can I help with?",
    //             type: AlexaSkill.speechOutputType.PLAIN_TEXT
    //         };
    //         response.ask(speechOutput, repromptOutput);
    //     }
    // },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "you can tell me what ingredients you have in your refrigerator. Please remind that you can only name maximum 3 items... Now, Tell me what do you have in your refrigerator?";
        var repromptText = "You can say things like, I want to cook but only have certain things in my refrigerator, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var sousChef = new sousChef();
    sousChef.execute(event, context);
};
