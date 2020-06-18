<template>
  <q-page padding class="relative dark">
    <q-list padding class="absolute-center" style="min-width:20em">
      <q-item v-if="!servers.length">
        <q-item-section>
          <q-item-label>For testing purposes we can add the server available on test.bki.pt</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>Change to bKit server:</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator spaced />
      <q-item clickable v-ripple
        @click="change(server)"
        v-for="(server, index) in servers" :key="index">
        <q-item-section avatar>
          <q-icon :color="color(server)" name="storage" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{server}}</q-item-label>
        </q-item-section>
        <q-item-section side v-show="isSelected(server)">
          <q-btn class="ndark" label="Go" color="ok" outline no-caps @click.stop="go"/>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-input rounded outlined dense clearable
            @keyup.enter="add"
            @keydown.tab="add"
            type="url"
            v-model="newserver"
            :loading="adding"
            :error="!!error"
            :error-message="`Server '${newserver}' not found`"
            @clear="error=false"
            placeholder="IP Address or Server Name"
            hint="Address of a bKit server"
            label="Add Server">
            <template v-slot:append>
              <q-btn class="ndark" outline icon="add" no-caps stack
                @click="add"
                v-if="!error && !adding"
                size="xs"
                round
                color="green"/>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list>
    <q-inner-loading :showing="loading">
      <q-spinner-ios size="6em" color="loader"/>
    </q-inner-loading>
  </q-page>
</template>

<script>
import { listServers, getServer, changeServer } from 'src/helpers/bkit'
import { warn } from 'src/helpers/notify'

export default {
  name: 'Servers',
  data () {
    return {
      current: undefined,
      newserver: undefined,
      loading: false,
      adding: false,
      error: false,
      servers: []
    }
  },
  watch: {
  },
  methods: {
    isSelected (server) {
      return server === this.current
    },
    color (server) {
      return this.isSelected(server) ? 'green' : 'cyan'
    },
    go () {
      this.$router.push('/backup')
    },
    change (server) {
      changeServer(server)
        .then(() => this.reload())
    },
    add () {
      if (!this.newserver) return
      this.error = null
      this.adding = true
      changeServer(this.newserver)
        .then(() => this.reload())
        .catch(err => {
          this.error = err
          warn(err)
        })
        .finally(() => {
          this.adding = false
        })
    },
    reload () {
      this.loading = true
      const p1 = listServers()
        .then(servers => {
          this.servers = servers
        })

      const p2 = getServer()
        .then(server => {
          this.current = server
          this.$store.commit('global/setServer', server)
        })
      return Promise.all([p1, p2])
        .finally(() => (this.loading = false))
    }
  },
  mounted () {
    this.reload()
  }
}
</script>
