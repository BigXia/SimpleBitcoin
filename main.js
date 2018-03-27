/**
*  依赖npm包，需要先在本地安装node并下载依赖包
*  npm install crypto-js
*  用来进行哈希运算
*/
const SHA256 = require('crypto-js/SHA256');

/**
*  区块，区块链的单位
*  index: 索引，又称区块高度，定长
*  timestamp: 时间戳，用来记录当前块的生成时间，定长
*  data: 区块的数据,用来记录一笔笔交易，变长，有最大值限制
*  previousHash: 上一个区块的哈希，防止链上数据被修改
*  hash: 当前块的hash. 256bit的摘要，以一个64位16进制数呈现
*/
class Block{
    constructor(index, timestamp, data, previousHash = '', nonce=0){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = nonce;
    }

    calculateHash(){
        return SHA256(this.index + this.timestamp + JSON.stringify(this.data).toString() + this.previousHash + this.nonce).toString();
    }

    /**
     *  proof of work
     *  工作量证明
     */
    mineBlock(difficulty){
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}

/**
*  区块链，由一个一个顺序相关的区块组成
*  @constructor：构造函数，this.chain表示区块链的数据
*  @createGenesisBlock: 生成创世块，创世块默认可信，无须验证
*  @getLatestBlock: 获得最近的一个区块
*  @addBlock: 向当前区块链中添加一个区块
*  @isChainValid: 验证区块链是否有效，创世块不需要验证
*/
class Blockchain {
    //构造函数，生成创世块
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    createGenesisBlock(){
        return new Block(0, "01/01/2018", "Genesis block", '0');
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    // newBlock 传入一个区块对象
    addBlock(newBlock){
        // 重写previousHash 和 hash
        newBlock.previousHash = this.getLatestBlock().hash;
        // newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty);

        //将区块追回到当前区块链
        this.chain.push(newBlock);
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }

            return true;
        }
    }
}

// 实例化一个区块链, 并创建一个创世区块
let testCoin = new Blockchain();

// 添加两个区块
testCoin.addBlock(new Block(1, "10/01/2018", { amount: 4 }));
testCoin.addBlock(new Block(2, "12/01/2018", { amount: 10 }));

// 打印区块链数据
console.log(JSON.stringify(testCoin,'',4));

// // 验证区块链是否有效, 结果为true
// console.log('Is blockchain valid？ ' + testCoin.isChainValid());
//
// // 修改区块数据
// testCoin.chain[1].data = { amount: 100 };
// // 验证区块链是否有效, 结果为false
// console.log('Is blockchain valid？ ' + testCoin.isChainValid());
