#!/bin/bash

# params: accountId, tokenId, title, description, media
echo $1

near login

export NFT_CONTRACT_ID=$1

near deploy $NFT_CONTRACT_ID nft-backend/build/nft.wasm

near call $NFT_CONTRACT_ID init '{"owner_id": "'$NFT_CONTRACT_ID'"}' --accountId $NFT_CONTRACT_ID

near call $NFT_CONTRACT_ID nft_mint '{"token_id": "'$2'", "metadata": {"title": "'$3'", "description": "", "media": "'$4'"}, "receiver_id": "'$NFT_CONTRACT_ID'"}' --accountId $NFT_CONTRACT_ID --amount 0.1