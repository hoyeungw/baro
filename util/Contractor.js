export class Contractor {
  service
  agents
  #occupied

  constructor(service, agentPool) {
    this.service = service
    this.agents = agentPool
  }

  static build(service, agentPool) { return new Contractor(service, agentPool) }

  async assignAgent() {
    if (!this.agents.length) await Promise.race(this.#occupied)
    return this.agents.shift()
  }

  createTask(agent, job) {
    return Promise.resolve().then(this.service.bind(agent, job))
  }

  addAgenda(agent, taskAsPromise) {
    const taskPromise = taskAsPromise.then(() => {
      // Xr()
      //   ['agent'](agent|> deco)
      //   ['agents'](this.agents |> deco)
      //   ['taskAsPromise'](taskAsPromise|> deco)
      //   ['#agentAgenda'](this.#taskAgenda |> deco)
      //   |> says['asyncPool']
      this.#occupied.delete(taskPromise)
      this.agents.push(agent)
      return agent
    })
    this.#occupied.add(taskPromise)
  }

  async takeOrders(jobs) {
    const delivers = []
    this.#occupied = new Set()
    for (const job of jobs) {
      const agent = await this.assignAgent()
      const taskPromise = this.createTask(agent, job)
      const busyPromise = taskPromise.then(() => {
        // says['agents'](Xr() ['curr'](deco(agent)) ['free'](deco(this.agents)))
        this.#occupied.delete(busyPromise)
        this.agents.push(agent)
        return agent
      })
      this.#occupied.add(busyPromise)
      delivers.push(taskPromise)
    }
    return Promise.all(delivers)
  }
}