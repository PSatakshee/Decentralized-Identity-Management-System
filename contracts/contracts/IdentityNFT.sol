// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    address public dimsContract;

    modifier onlyDIMS() {
        require(msg.sender == dimsContract, "Only DIMS can call this");
        _;
    }

    constructor(address initialOwner)
        ERC721("IdentityNFT", "IDNFT")
        Ownable(initialOwner) // 🧠 REQUIRED for OZ v5+
    {
        tokenCounter = 0;
    }

    function setDIMSContract(address _dimsContract) external onlyOwner {
        dimsContract = _dimsContract;
    }

    function mint(address to, string memory tokenURI) external onlyDIMS {
        uint256 newTokenId = tokenCounter;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter++;
    }
}