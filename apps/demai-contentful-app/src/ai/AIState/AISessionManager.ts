import AIState from "./AIState";

export default class AISessionManager {
  private _session: AIState[] = [];
  private _setAISession: React.Dispatch<React.SetStateAction<AIState[]>>;
  private _setAIState: React.Dispatch<
    React.SetStateAction<AIState | undefined>
  >;
  private _activeAIState: AIState | undefined;

  constructor(
    setAISession: React.Dispatch<React.SetStateAction<AIState[]>>,
    setAIState: React.Dispatch<React.SetStateAction<AIState | undefined>>
  ) {
    this._setAISession = setAISession;
    this._setAIState = setAIState;
  }

  addAndActivateAIState(newAIState: AIState) {
    this.addAIState(newAIState);
    this.setActiveAIState(newAIState);
    newAIState.updateStatus();
  }

  addAIState(newAIState: AIState) {
    this._session.push(newAIState);
    this._setAISession(this._session);
  }

  getSessions() {
    return this._session;
  }

  getLastState() {
    if (this._session.length === 0) {
      return;
    }
    return this._session[this._session.length - 1];
  }

  refreshState() {
    this._setAISession(this._session);
  }

  setActiveAIState(newAIState: AIState) {
    this._activeAIState = newAIState;
    this._setAIState(this._activeAIState);
  }
}
