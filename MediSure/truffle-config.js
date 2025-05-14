module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // Default Ganache port
      network_id: "*", // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "0.8.19", // Match your contract's pragma
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};