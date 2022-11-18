import fetch from "node-fetch";
const experienceKey = "INSERT_EXPERIENCE_KEY";
const apiKey = "INSERT_API_KEY";

// function which hits Search API and passing results through the result parser function
export const conductSearch = async (query) => {
    const searchResults = await fetch(`https://liveapi.yext.com/v2/accounts/me/answers/query?input=${query}&experienceKey=${experienceKey}&api_key=${apiKey}&v=20220511&version=PRODUCTION&source=GMBchatbot`).then(response => response.json());
    return chooseResults(searchResults);
}

// function which chooses which search results to send back to Dialogflow
const chooseResults = (searchResults) => {
    const results = searchResults.response;
    // check for a direct answer
    if (results.directAnswer) {
        // check for featured snippet first, then field level
        if (results.directAnswer.type === "FEATURED_SNIPPET") {
            return formatDirectAnswer(results.directAnswer.answer.snippet.value);
        } else if (results.directAnswer.type === "FIELD_VALUE") {
            if (results.directAnswer.answer.fieldType === "address") {
                // format address
                const line1 = results.directAnswer.answer.value.line1;
                const line2 = results.directAnswer.answer.value.line2;
                const city = results.directAnswer.answer.value.city;
                const region = results.directAnswer.answer.value.region;
                const postalCode = results.directAnswer.answer.value.postalCode;
                const formattedAddress = `${line1}\n${line2}\n${city}, ${region}\n${postalCode}`;
                return formatDirectAnswer(formattedAddress);

            } else {
                return formatDirectAnswer(results.directAnswer.answer.value);
            }
        }
    } else {
        // if no direct answer, send up to three entity results
        const result1 = {
            name: results.modules[0].results[0].data.name,
            url: results.modules[0].results[0].data.landingPageUrl
        };
        const result2 = {
            name: results.modules[0].results[1].data.name,
            url: results.modules[0].results[1].data.landingPageUrl
        };
        const result3 = {
            name: results.modules[0].results[2].data.name,
            url: results.modules[0].results[2].data.landingPageUrl
        }
        const resultsArray = [result1,result2,result3];
        return formatEntityResults((resultsArray));
    }
}

// formats entity results to become rich cards in business messages
const formatEntityResults = (results) => {
    const payload = {
        "fallback": "This is a fallback.",
        "richCard": {
          "carouselCard": {
            "cardWidth": "MEDIUM",
            "cardContents": [
              {
                "title": results[0].name,
                "description": "This is a description of a search result.",
                "media": {
                  "height": "MEDIUM",
                  "contentInfo": {
                    "fileUrl": "",
                    "thumbnailUrl": "",
                    "forceRefresh": false,
                    "altText": "card image"
                  }
                },
                "suggestions": [
                  {
                    "action": {
                      "text": "Learn more",
                      "postbackData": "cta clicked",
                      "openUrlAction": {
                        "url": results[0].url
                      }
                    }
                  }
                ]
              },
              {
                "title": results[1].name,
                "description": "This is a description of a search result.",
                "media": {
                  "height": "MEDIUM",
                  "contentInfo": {
                    "fileUrl": "",
                    "thumbnailUrl": "",
                    "forceRefresh": false,
                    "altText": "card image"
                  }
                },
                "suggestions": [
                  {
                    "action": {
                      "text": "Learn more",
                      "postbackData": "cta clicked",
                      "openUrlAction": {
                        "url": results[1].url
                      }
                    }
                  }
                ]
              },
              {
                "title": results[2].name,
                "description": "This is a description of a search result.",
                "media": {
                  "height": "MEDIUM",
                  "contentInfo": {
                    "fileUrl": "",
                    "thumbnailUrl": "",
                    "forceRefresh": false,
                    "altText": "card image"
                  }
                },
                "suggestions": [
                  {
                    "action": {
                      "text": "Learn more",
                      "postbackData": "cta clicked",
                      "openUrlAction": {
                        "url": results[2].url
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      };
      const response = {
        "fulfillment_response": {
          "messages": [
            {
              payload
            }
          ]
        }
      }
      return(response);
};

// formats direct answers to be sent to Dialogflow
const formatDirectAnswer = (results) => {
    const payload = results;
    const response = {
        "fulfillment_response": {
            "messages": [
                {
                    "text": {
                        "text": [ payload ] 
                    }
                }
            ]
        }
    }
    return(response);
};