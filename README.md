# Decentraveler

## Inspiration

Our group is all immigrants and having known how hard it is for people to get accustomed to a new city, province, state or even country, we wanted to reduce the friction. Instead of just designing an app for immigrants, we decided to broaden our scope and include anyone, anyone who wants to get accustomed to a new area of the world can use our app to do so.


## What It Does

Decentraveller lets you travel anywhere at any time through a decentralized system in your browser. You can pick any location and travel there through the 3D Cryptoverse, viewing the world around you in high fidelity as if you were there. Inside, you can interact with locals, trade with them as you would in real life, using near tokens, and immortalize your experience on the blockchain with an NFT.


## How We Built It

Our program is multi-faceted. Our client-facing application is a game developed in Unity and C#. The backend that supports it is a Node.js + Express.js server that also uses TypeScript. Alongside these languages, our backend API supports Chat Completions with GPT4o, DALLE image generation, NEAR transactions, NFT minting, and location-based elevation mapping. Our client-facing game uses Google Earth API, along with our custom backend API, to serve a Cryptoverse experience.


## Challenges We Ran Into

One of the most significant challenges that we ran into early on was deciphering NEAR documentation and understanding the various cryptocurrency terms as absolute beginners. Later, during the hackathon, this translated into a struggle to deploy Smart Contracts and mint NFTs. In addition, our tech stack is heavily multi-faceted, however, this posed serious project-blocking issues for us. Primarily, the key issue we faced was sending chat completions to the client-facing game because it took us hours to create valid JSON-like data in C# and send it to a Node.js backend. In the end, perseverance prevailed and we managed to solve these issues.


## Accomplishments That We're Proud Of

We are proud of a lot of features that were implemented. To begin with, we found it quite impressive that we were able to use Google Earth API and live stream it to Unity only to render it all around the user. We are also super proud of being able to implement Smart Contracts to mint our own NFT which took quite a bit of effort. Of course, connecting our C# frontend to our Node.js backend and receiving and sending GPT messages was also a feat that was crucial to the success of our program.


## What We Learned

We learned a lot about Unity, Crypto and the Cryptoverse this hackathon. We learned how to connect a C# frontend to a Node.js backend, how to easily make transactions with $NEAR, how to mint NFTs with Smart Contracts, and a lot more. We also learned the importance of testing with tools like Postman, so that there are fewer integration errors in the future.


## What's Next?

We hope to use RAG to give more relevant context to each character within the game to provide a smoother experience. We also want to expand our game and make smoother integrations between it and $NEAR. Most importantly, we want to make our NFT more customized and expose certain functions on it