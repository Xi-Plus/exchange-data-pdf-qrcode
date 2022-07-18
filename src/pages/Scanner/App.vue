<template>
  <v-app>
    <v-app-bar dense app color="primary" dark>
      <v-app-bar-title>QR Code Scanner</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn color="secondary" href="/">Generator</v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="pb-16">
        <div style="width: 350px" id="reader"></div>

        <div>
          <span :class="{ blinktext: blinking }" style="font-size: 32px">Scanned: {{ prev_name }}</span>

          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Field</th>
                  <th class="text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>{{ formData.name }}</td>
                </tr>
                <tr>
                  <td>National ID</td>
                  <td>{{ formData.national_id }}</td>
                </tr>
                <tr>
                  <td>Birthday</td>
                  <td>{{ formData.birthday }}</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>
                    <span v-if="formData.gender === 'M'">Male</span>
                    <span v-else-if="formData.gender === 'F'">Female</span>
                  </td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td>{{ formData.address }}</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>{{ formData.phone }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>

        <fieldset class="mt-5" style="padding: 20px">
          <legend>Preference</legend>

          <div class="d-flex flex-row flex-wrap" style="align-items: center">
            <v-switch class="mr-2" v-model="playSuccess" label="Scanning sound"></v-switch>
            <v-switch class="mr-2" v-model="blinkAnimate" label="Scanning animate"></v-switch>
          </div>
        </fieldset>

        <v-overlay :value="loading" opacity="0.2">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { formKeys, idx2key } from '../../plugins/util'
import { Howl } from 'howler'

export default {
  name: 'App',

  components: {},

  data: () => ({
    formData: {},
    prevQrcode: '',
    prev_name: '',
    loading: false,
    blinking: false,
    playSuccess: true,
    blinkAnimate: true,
  }),

  mounted() {
    this.soundBeep = new Howl({
      src: ['beep1.mp3'],
      html5: true,
      preload: true,
    })

    let html5QrcodeScanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      },
      /* verbose= */ false
    )
    html5QrcodeScanner.render(this.scanCallback, () => {})
  },

  methods: {
    scanCallback(decodedText) {
      if (decodedText == this.prevQrcode) {
        return
      }
      if (this.playSuccess) {
        this.soundBeep.play()
      }
      console.log(decodedText)
      this.prevQrcode = decodedText
      this.parseData(decodedText)
    },
    parseData(text) {
      console.log(text)
      let query = new URLSearchParams(text)
      let res = {}

      formKeys.forEach((key, idx) => {
        if (query.get(idx2key(idx))) {
          res[key] = query.get(idx2key(idx))
        } else {
          res[key] = null
        }
      })
      console.log(res)

      this.formData = res
      this.prev_name = res.name
      if (this.blinkAnimate) {
        this.blinking = true
        setTimeout(() => {
          this.blinking = false
        }, 2000)
      }
    },
  },
}
</script>

<style scoped>
.blinktext {
  animation: blink-text 500ms linear infinite;
}

@keyframes blink-text {
  0% {
    background-color: rgba(0, 0, 0, 0);
  }
  50% {
    background-color: #77ff77;
  }
  100% {
    background-color: rgba(0, 0, 0, 0);
  }
}

.v-btn {
  text-transform: unset;
}
</style>
