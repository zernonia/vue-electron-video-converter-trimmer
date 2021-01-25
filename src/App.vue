<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Converter</router-link> |
      <router-link to="/trimmer">Trimmer</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
* {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 0;
  margin: 0;
}
body {
  background: aqua;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  justify-content: center;
  height: 100vh;
  align-content: baseline;
  background: aqua;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #409EFF;
}
</style>
