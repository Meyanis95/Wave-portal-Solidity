async function main () {
	const [owner, randoPerson] = await ethers.getSigners()
	const waveContractFactory = await hre.ethers.getContractFactory("WavePortal")
	const waveContract = await waveContractFactory.deploy({value: hre.ethers.utils.parseEther("0.1")})
	await waveContract.deployed()
	console.log("Contract deployed to:", waveContract.address)

	let contractBalance = await hre.ethers.provider.getBalance(waveContract.address)
	console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance))

	let waveTxn = await waveContract.wave("first one :)")
	await waveTxn.wait()

	waveTxn = await waveContract.wave("Hey mate!")
	await waveTxn.wait()

	contractBalance = await hre.ethers.provider.getBalance(waveContract.address)
	console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance))

}

main()
	.then( () => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1)
	});