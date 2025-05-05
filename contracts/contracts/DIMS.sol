// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IIdentityNFT {
    function mint(address to, string memory tokenURI) external;
}

contract DIMS {
    struct Identity {
        string name;
        string email;
        address owner;
        bool isVerified;
        string ipfsHash;   // Store the IPFS hash of identity proof
        string fileHash;   // Store the SHA-256 hash of the file
    }

    address public owner;
    mapping(address => Identity) public identities;
    address[] public verifiedUsers;
    IIdentityNFT public nftContract;

    event IdentityRegistered(address indexed user, string name, string email, string ipfsHash, string fileHash);
    event IdentityVerified(address indexed user);
    event IdentityRevoked(address indexed user);
    event IdentityProofUpdated(address indexed user, string newIpfsHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setNFTContract(address nftAddress) external onlyOwner {
        nftContract = IIdentityNFT(nftAddress);
    }

    function registerIdentity(
        string memory name,
        string memory email,
        string memory ipfsHash,
        string memory fileHash
    ) public {
        require(bytes(identities[msg.sender].name).length == 0, "Identity already exists");
        identities[msg.sender] = Identity(name, email, msg.sender, false, ipfsHash, fileHash);
        emit IdentityRegistered(msg.sender, name, email, ipfsHash, fileHash);
    }

    function verifyIdentity(address user) public onlyOwner {
        require(bytes(identities[user].name).length != 0, "Identity not found");
        require(!identities[user].isVerified, "Already verified");
        identities[user].isVerified = true;

        bool alreadyAdded = false;
        for (uint i = 0; i < verifiedUsers.length; i++) {
            if (verifiedUsers[i] == user) {
                alreadyAdded = true;
                break;
            }
        }
        if (!alreadyAdded) {
            verifiedUsers.push(user);
        }

        // Mint NFT identity badge
        nftContract.mint(user, identities[user].ipfsHash);

        emit IdentityVerified(user);
    }

    function getVerifiedUsers() public view returns (address[] memory) {
        return verifiedUsers;
    }

    function getIdentity(address user) public view returns (
        string memory,
        string memory,
        address,
        bool,
        string memory,
        string memory
    ) {
        Identity memory id = identities[user];
        require(bytes(id.name).length != 0, "Identity not found");
        return (id.name, id.email, id.owner, id.isVerified, id.ipfsHash, id.fileHash);
    }

    function revokeIdentity(address user) public {
        require(identities[user].isVerified, "Identity not verified");
        identities[user].isVerified = false;

        // Remove from verifiedUsers array
        for (uint i = 0; i < verifiedUsers.length; i++) {
            if (verifiedUsers[i] == user) {
                verifiedUsers[i] = verifiedUsers[verifiedUsers.length - 1];
                verifiedUsers.pop();
                break;
            }
        }

        emit IdentityRevoked(user);
    }

    function updateIdentityProof(string memory ipfsHash) public {
        require(bytes(identities[msg.sender].name).length != 0, "Identity not found");
        identities[msg.sender].ipfsHash = ipfsHash;
        emit IdentityProofUpdated(msg.sender, ipfsHash);
    }
}
