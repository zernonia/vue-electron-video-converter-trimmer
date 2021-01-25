<template>
  <video ref="videoPlayer" class="video-js"></video>
</template>

<script>
import videojs from "video.js";

export default {
  name: "VideoPlayer",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      player: null,
    };
  },
  watch: {
    options : {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        console.log({newVal, oldVal});
        if(this.player) {
          setTimeout(() => {
            this.setVideoJS()
          }, 500);
        }
      }
    }
  },
  methods: {
    setVideoJS() {
      this.player = videojs(
        this.$refs.videoPlayer,
        this.options,
        function onPlayerReady() {
          console.log("onPlayerReady", this);
        }
      );
    }
  },
  mounted() {
    this.setVideoJS()
  },
  beforeDestroy() {
    if(this.player) {
      this.player.dispose();
    }
  },
};
</script>
