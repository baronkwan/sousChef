'use strict';

var AlexaSkill = require('./AlexaSkill'),




var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var apiKey = 'CDuvhNlqmKmsh4WW0CN3TBu4t5LZp1iEFwbjsnuitovCiPk3pv'
var sousChef = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
sousChef.prototype = Object.create(AlexaSkill.prototype);
sousChef.prototype.constructor = sousChef;

sousChef.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    session.attributes.ingredients = []
    var speechText = "Welcome to Amazon Alexa sousChef, you can tell me what ingredients you have in your refrigerator, and I'll give you a recipe.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

sousChef.prototype.intentHandlers = {
    // Custom Intent
    "AddIngredientIntent": function (intent, session, response) { 
        var ingredient = intent.slots.Ingredient.value;
        if (!ingredient) {
              response.ask('I do not know that ingredient.', 'What do you have in your kitchen?');
              return;

        } else {
            session.attributes.ingredients.push[ingredient];
            response.tell('Ok, you have ' )
            return;
        };

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
        var speechText = "you can tell me what ingredients you have in your refrigerator. Now, Tell me what do you have in your refrigerator?";
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

function getJsonRecipesFromIngredients(eventCallback) {

    var urlPrefix = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients';
    var ingredients = encodeURIComponent(session.attributes.ingredients.join('%2C+')) ;
    console.log(ingredients);

    var url = urlPrefix;

    


    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseJsonForFirstRecipe(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseJsonForFirstRecipe(body)
{
    var jsonSteps=body[0].["steps"];
    var steps = [];
    var stepsLength = steps.length;
    for (var i = 0; i < stepsLength; i++) {
        step = jsonSteps[i].["step"];
        steps.push(step);
    };
    return steps;
}




exports.handler = function (event, context) {
    var sousChef = new sousChef();
    sousChef.execute(event, context);
};
