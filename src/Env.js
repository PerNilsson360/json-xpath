class Env {
  constructor(context) {
    this.context = context;
    // todo make sure context is a Value of NodeSet type
  }

  getRoot() {
    return this.context.getRoot();
  }
}

exports.Env = Env;
