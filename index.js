import "./style.css";
import React, { Component, useState } from "react";
import { render } from "react-dom";

import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";

import { Grommet } from 'grommet';

// Stores are where the business logic resides
class UserStore {
  nextID = 3;
  @observable users = [
        {'id': 0, 'first': 'Joe', 'last': 'Bloggs',
            'email': 'joe@bloggs.com', 'role': 'student', 'actived': false},
        {'id': 1, 'first': 'Ben', 'last': 'Bitdiddle',
            'email': 'ben@cuny.edu', 'role': 'student', 'actived': false},
        {'id': 2, 'first': 'Alissa P', 'last': 'Hacker',
            'email': 'missalissa@cuny.edu', 'role': 'professor', 'actived': false},
    ];
  @observable filterType = "All";

  @observable model = "create";
  @observable updateID = null;

  // compute a filtered list of users
  @computed
  get filtered() {
    if (this.filterType === "All") {
      return this.users;
    } else if (this.filterType === "Active") {
      return this.users.filter(t => t.actived);
    } else {
      return this.users.filter(t => !t.actived);
    }
  }

  @computed
  get filterCompleted() {
    return this.users.filter(t => t.actived);
  }

  @computed
  get submitName() {
    if (this.model === "create") {
      return "Create User"
    } else {
      return "Update User"
    }
  }

  // set a filter type: "All", "Active" or "Inactive"
  @action
  setFilterType(filterType) {
    this.filterType = filterType;
  }

  @action
  setModel(model) {
    this.model = model;
  }

  @action
  setUpdateID(id) {
    this.updateID = id;
  }

  // create a user
  @action
  create = info => {
    let id = this.nextID;
    this.nextID += 1;
    this.users.push({ id: id, first: info.first, last: info.last, email:info.email, role: info.role, actived: false });
  };

  // update a user
  @action
  update = info => {
    let user = this.users.find(e => e.id === this.updateID);
    if (user) {
      user.first = info.first;
      user.last = info.last;
      user.email = info.email;
      user.role = info.role;
    }
  };

  // toggle the completion state of a user
  @action
  toggle = id => {
    let user = this.users.find(e => e.id === id);
    if (user) {
      user.actived = !user.actived;
    }
  };

}

@observer
class UserForm extends Component {
  constructor(props) {
    super(props);
  }

  @observable firstInput = "";
  @observable lastInput = "";
  @observable emailInput = "";
  @observable roleInput = "";

  @computed
  get getInfo() {
    return {first: this.firstInput, last: this.lastInput, email: this.emailInput, role: this.roleInput}
  }

  onFormSubmit = event => {
    event.preventDefault();
    if (this.props.userStore.model === "create") {
      this.props.userStore.create(this.getInfo);
    } else {
      this.props.userStore.update(this.getInfo);
      this.props.userStore.setModel("create")
    }
    this.firstInput = "";
    this.lastInput = "";
    this.emailInput = "";
    this.roleInput = "";
  };

  @action
  handleFirstInputChange = event => {
    this.firstInput = event.target.value;
  };
  @action
  handleLastInputChange = event => {
    this.lastInput = event.target.value;
  };
  @action
  handleEmailInputChange = event => {
    this.emailInput = event.target.value;
  };
  @action
  handleRoleInputChange = event => {
    this.roleInput = event.target.value;
  };

  render() {
    return (
      <form onSubmit={this.onFormSubmit}>
        <label>
          first:
          <input
            type="text"
            name="first"
            value={this.firstInput}
            onChange={this.handleFirstInputChange}
          />
        </label>
        <br/>
        <label>
          last:
          <input
            type="text"
            name="last"
            value={this.lastInput}
            onChange={this.handleLastInputChange}
          />
        </label>
        <br/>
        <label>
          email:
          <input
            type="text"
            name="email"
            value={this.emailInput}
            onChange={this.handleEmailInputChange}
          />
        </label>
        <br/>
        <label>
          role:
          <select onChange={this.handleRoleInputChange}>
            <option value="">--Please choose a role--</option>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>
        </label>
        <br/>
        <input type="submit" value={this.props.userStore.submitName} />
      </form>
    );
  }
}

const UserView = ({ onClick, first, last, email, role, actived, onChageModel }) => (
  <tr>
    <th>
      {first}
    </th>
    <th>
      {last}
    </th>
    <th>
      {email}
    </th>
    <th>
      <select>
        <option >{role}</option>
      </select>
    </th>
    <th>
      <input
        type="checkbox"
        name="is_finish"
        value={actived}
        checked={actived}
        onClick={onClick}
      />
    </th>
    <th>
      <a href="#" onClick={onChageModel}>Edit</a>
    </th>
  </tr>
);

const Link = ({ active, children, onClick }) => {
  if (active) {
    return (
      <span>
        {" | "} {children}
      </span>
    );
  }

  return (
    <a href="#" onClick={onClick}>
      {" | "}
      {children}
    </a>
  );
};

const UserFilter = observer(({ userStore }) => (
  <span>
    <b>Filter Users</b>:
    {["All", "Active", "Inactive"].map((status, i) => (
      <Link
        key={i}
        active={userStore.filterType === status}
        onClick={() => userStore.setFilterType(status)}
      >
        {status}
      </Link>
    ))}
  </span>
));

const UserCounter = observer(({ userStore }) => (
  <span>
    <b>{userStore.filterCompleted.length} of {userStore.users.length} Actived</b>
  </span>
));

const UserList = observer(({ userStore }) => (
  <table>
    <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email Address</th>
        <th>Role</th>
        <th>Active</th>
      </tr>
    </thead>
    <tbody>
      {userStore.filtered.map(t => (
        <UserView
          key={t.id}
          first={t.first}
          last={t.last}
          email={t.email}
          role={t.role}
          actived={t.actived}
          onClick={() => {
            userStore.toggle(t.id);
          }}
          onChageModel={() => {
            userStore.setModel("edit")
            userStore.setUpdateID(t.id)
          }}
        />
      ))}
    </tbody>
    <tfoot>
      <tr>
        <UserCounter userStore={userStore} />
      </tr>
    </tfoot>
  </table>
));

@observer
class JSONView extends Component {
  @observable showJSON = false;

  toggleShowJSON = () => {
    this.showJSON = !this.showJSON;
  };

  render() {
    return (
      <div>
        <input
          type="checkbox"
          name="showjson"
          value={this.showJSON}
          onChange={this.toggleShowJSON}
        />
        Show JSON
        {this.showJSON && <p>{JSON.stringify(this.props.store)}</p>}
      </div>
    );
  }
}

const UserApp = observer(() => {

  const userStore = new UserStore();
  document.userStore = userStore

  return (
    <div>
      <UserForm userStore={userStore} />
      <hr />
      <UserList userStore={userStore} />
      <hr />
      <UserFilter userStore={userStore} />
      <JSONView store={userStore} />
    </div>)
})


render(<UserApp />, document.getElementById("app"));
