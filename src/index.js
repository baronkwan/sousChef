'use strict';

/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

function AlexaSkill(appId) {
    this._appId = appId;
}

AlexaSkill.speechOutputType = {
    PLAIN_TEXT: 'PlainText',
    SSML: 'SSML'
}

AlexaSkill.prototype.requestHandlers = {
    LaunchRequest: function (event, context, response) {
        this.eventHandlers.onLaunch.call(this, event.request, event.session, response);
    },

    IntentRequest: function (event, context, response) {
        this.eventHandlers.onIntent.call(this, event.request, event.session, response);
    },

    SessionEndedRequest: function (event, context) {
        this.eventHandlers.onSessionEnded(event.request, event.session);
        context.succeed();
    }
};

/**
 * Override any of the eventHandlers as needed
 */
AlexaSkill.prototype.eventHandlers = {
    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    onSessionStarted: function (sessionStartedRequest, session) {
    },

    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    onLaunch: function (launchRequest, session, response) {
        throw "onLaunch should be overriden by subclass";
    },

    /**
     * Called when the user specifies an intent.
     */
    onIntent: function (intentRequest, session, response) {
        var intent = intentRequest.intent,
            intentName = intentRequest.intent.name,
            intentHandler = this.intentHandlers[intentName];
        if (intentHandler) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this, intent, session, response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
    },

    /**
     * Called when the user ends the session.
     * Subclasses could have overriden this function to close any open resources.
     */
    onSessionEnded: function (sessionEndedRequest, session) {
    }
};

/**
 * Subclasses should override the intentHandlers with the functions to handle specific intents.
 */
AlexaSkill.prototype.intentHandlers = {};

AlexaSkill.prototype.execute = function (event, context) {
    try {
        console.log("session applicationId: " + event.session.application.applicationId);

        // Validate that this request originated from authorized source.
        if (this._appId && event.session.application.applicationId !== this._appId) {
            console.log("The applicationIds don't match : " + event.session.application.applicationId + " and "
                + this._appId);
            throw "Invalid applicationId";
        }

        if (!event.session.attributes) {
            event.session.attributes = {};
        }

        if (event.session.new) {
            this.eventHandlers.onSessionStarted(event.request, event.session);
        }

        // Route the request to the proper handler which may have been overriden.
        var requestHandler = this.requestHandlers[event.request.type];
        requestHandler.call(this, event, context, new Response(context, event.session));
    } catch (e) {
        console.log("Unexpected exception " + e);
        context.fail(e);
    }
};

var Response = function (context, session) {
    this._context = context;
    this._session = session;
};

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam.speech
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam.speech || optionsParam
        }
    }
}

Response.prototype = (function () {
    var buildSpeechletResponse = function (options) {
        var alexaResponse = {
            outputSpeech: createSpeechObject(options.output),
            shouldEndSession: options.shouldEndSession
        };
        if (options.reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: createSpeechObject(options.reprompt)
            };
        }
        if (options.cardTitle && options.cardContent) {
            alexaResponse.card = {
                type: "Simple",
                title: options.cardTitle,
                content: options.cardContent
            };
        }
        var returnResult = {
                version: '1.0',
                response: alexaResponse
        };
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }
        return returnResult;
    };

    return {
        tell: function (speechOutput) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                shouldEndSession: true
            }));
        },
        tellWithCard: function (speechOutput, cardTitle, cardContent) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: true
            }));
        },
        ask: function (speechOutput, repromptSpeech) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                shouldEndSession: false
            }));
        },
        askWithCard: function (speechOutput, repromptSpeech, cardTitle, cardContent) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: false
            }));
        }
    };
})();

// module.exports = AlexaSkill;


// var AlexaSkill = require('./AlexaSkill');
var https = require('https');


var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var apiKey = process.env.APP_KEY;
var SousChef = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SousChef.prototype = Object.create(AlexaSkill.prototype);
SousChef.prototype.constructor = SousChef;

SousChef.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    session.attributes.ingredients = [];
    var speechText = "Welcome to Amazon Alexa SousChef, you can tell me what ingredients you have in your kitchen, and I'll give you a recipe.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

SousChef.prototype.intentHandlers = {
    // Custom Intent
    "AddIngredientIntent": function (intent, session, response) { 

        var ingredient = intent.slots.Ingredient.value;
        // will always goes into else since ingredient will alway be true as user speak up
        if (ingredient === "help") {
              response.ask('I do not know that ingredient.', 'What else do you have in your kitchen?');

        } else {
            session.attributes.ingredients.push[ingredient];
            console.log(session.attributes);
            response.ask('Ok, you have ' + ingredient + '. what else do you have in your kitchen?' );
        }

    },

    "GetRecipeIntent": function (intent, session, response) {
        // Find by ingredient API => return the id of the dish
        // getAnlyzedRecipeInstruction API => return JSON we need to parse it
        var reaction = intent.slots.value;
// ==============================================================================================================
        var ingredientsList = session.attributes.ingredients;
        
        console.log("Ingredients List: " + ingredients);

// ==============================================================================================================
        var recipeObject = getRecipeInfo(ingredientsList);

        getRecipeSteps(recipeObject.id, function(events) {
            var speechText = "With these ingredients, I have find you a recipe for ." + recipeObject.title;
            console.log("**********");
            console.log("events: ", events);
            console.log('sessionAttributes', sessionAttributes);
        
            var repromptText = "Do you want to hear the step by step instruction?";

            var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            var repromptOutput = {
                    speech: repromptText,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        });

    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "you can tell me what ingredients you have in your refrigerator. Now, Tell me what do you have in your kitchen?";
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

// Return back an recipe object with id and title name
function getRecipeInfo(array) {

    var ingredientsString = "";
    for (var i=0; i < array.length; i++) {
        if (ingredientsString === "") {
            ingredientsString.concat(array[i])
        } else {
            ingredientsString.concat(",",array[i])
        }
    }
    var hostname = 'spoonacular-recipe-food-nutrition-v1.p.mashape.com';
    var pathPrefix = '/recipes/findByIngredients?fillIngredients=false&limitLicense=false&ranking=1&ingredients=';
    // var ingredients = encodeURIComponent(session.attributes.ingredients.join('%2C+')) ;
    var pathSuffix = ingredientsString + '&number=5';

    
    var option = {
      hostname: hostname,
      path: pathPrefix + ingredients,
      headers: {
        'X-Mashape-Key': apiKey
      }
    };

    https.get(option, function(res) {
        var body = "";

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var recipeInfoResult = parseJsonForRecipeInfo(body);
            return recipeInfoResult
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function getRecipeSteps(id, eventCallback) {
    console.log('==============================')
    console.log("calling custom method: getRecipeSteps: ")

    var hostname = 'spoonacular-recipe-food-nutrition-v1.p.mashape.com'
    var path = '/recipes/' + id + '/analyzedInstructions?stepBreakdown=true'

    var option = {
      hostname: hostname,
      path: path,
      headers: {
        'X-Mashape-Key': apiKey
      }
    };


    var req = https.get(option, function(res) {
    var body = "";
    
    res.on('data', function (chunk) {
        body += chunk;
    });

    res.on('end', function () {
        var recipeStepsResult = parseJsonForRecipeSteps(body);
        eventCallback(recipeStepsResult);

    }).on('error', function (e) {
        console.log("Got error from getRecipeSteps", e);
    });

});
}

function parseJsonForRecipeInfo(body) {
    var recipes = JSON.parse(body);
    var recipesArr = [];
    
    console.log('Recipes: ',recipes.length);
    for (var i=0; i < recipes.length; i++) {
        recipesArr.push(recipes[i]);
    }
    var sortedByLikesArr = recipesArr.sort(function compare(a,b) {
      if (a.likes > b.likes)
        return -1;
      if (a.likes < b.likes)
        return 1;
      return 0;
    });
    console.log(sortedByLikesArr[0]);
    return sortedByLikesArr[0];
}

// return recipe steps in array form
function parseJsonForRecipeSteps(body) {
    var recipeSteps = JSON.parse(body)[0].steps;
    var recipeStepsArr = [];

    for (var i=0; i< recipeSteps.length; i++) {
        recipeStepsArr.push(recipeSteps[i].step);
    }
    console.log("Steps are: ");
    console.log(recipeStepsArr);
    return recipeStepsArr;
}


exports.handler = function (event, context) {
    var myChef = new SousChef();
    myChef.execute(event, context);
};