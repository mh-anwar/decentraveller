#!/bin/bash

# params: accountId, tokenId, title, description, media
echo "hi"

near login

export NFT_CONTRACT_ID=$1

echo $NFT_CONTRACT_ID

near deploy $NFT_CONTRACT_ID nft-backend/build/nft.wasm
echo $2
near call $NFT_CONTRACT_ID nft_mint '{"token_id": "'$2'", "metadata": {"title": "'$3'", "description": "'$4'", "media": "'$5'"}, "receiver_id": "'$NFT_CONTRACT_ID'"}' --accountId $NFT_CONTRACT_ID --amount 0.1