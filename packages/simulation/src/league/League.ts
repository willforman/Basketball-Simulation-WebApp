import { Team } from "../team/Team";
import { LeagueNames } from "../models";
import { proposeTrades } from "../team/trade";

import { RegularSeason } from "./RegularSeason";
import { Playoffs } from "./Playoffs";
import { FreeAgents } from "./FreeAgents";
import { Draft } from "./Draft";
import { Conferences } from "./Conferences";
import { Player } from "../player/Player";
import { LeagueState, getNextState } from "./LeagueState";

export class League {
  private _state: LeagueState;
  private _year: number;

  //private _teams: Team[];
  private _conferences: Conferences;

  private _regularSeason: RegularSeason;
  private _playoffs: Playoffs;

  private _freeAgents: FreeAgents;
  private _draft: Draft;

  private _players: Player[];
  private _genPlayer: (pos: number, retire: (player: Player) => void) => Player;

  get START_YEAR(): number {
    return 2021;
  }

  constructor(genPlayerName: () => string, confNames: LeagueNames) {
    this._state = LeagueState.REGULAR_SEASON;
    this._year = this.START_YEAR;

    this._players = [];

    let playerID = 0;
    const getPlayerID = (): number => {
      return playerID++;
    };

    const genPlayer = (
      pos: number,
      retire: (player: Player) => void,
      young: boolean
    ) => {
      const player = new Player(
        genPlayerName(),
        getPlayerID(),
        pos,
        retire,
        young
      );
      this._players.push(player);
      return player;
    };

    this._genPlayer = (pos: number, retire: (player: Player) => void) => {
      return genPlayer(pos, retire, true);
    };

    const genPlayerAnyAge = (pos: number, retire: (player: Player) => void) => {
      return genPlayer(pos, retire, false);
    };

    this._conferences = new Conferences(confNames, genPlayerAnyAge);

    this._regularSeason = new RegularSeason(this.teams, this.triggerTrades);

    this._freeAgents = new FreeAgents(genPlayerAnyAge);
    this._draft = new Draft(this._genPlayer);
  }

  triggerTrades = (): void => {
    //proposeTrades(this.teams);
  };

  advToPlayoffs(): void {
    this._state = getNextState(this._state);

    if (!this._regularSeason.completed) {
      throw new Error(`Regular season isn't completed`);
    }

    this._playoffs = new Playoffs(this._conferences.playoffTeams);

    const nonPlayoffTeams = this._conferences.nonPlayoffTeams[0].concat(
      this._conferences.nonPlayoffTeams[1]
    );
    this._draft.addNonPlayoffTeams(nonPlayoffTeams);
  }

  advToDraft(): void {
    this._state = getNextState(this._state);

    if (!this._playoffs.completed) {
      throw new Error(`Playoffs aren't completed`);
    }

    this._year++;

    this._conferences.advanceYear();
    this._freeAgents.advanceYear();

    this._draft.addPlayoffTeams(this._playoffs.teamsInDraftOrder);
    this._draft.setPicksInOrder();
  }

  advToFreeAgency(): void {
    this._state = getNextState(this._state);

    if (!this._draft.completed) {
      throw new Error(`Draft isn't completed`);
    }

    this._freeAgents.addPlayers(this._draft.players);

    this._draft = new Draft(this._genPlayer);

    this.teams.forEach((team: Team) => team.renewFreeAgents());
  }

  advToRegSeason(): void {
    this._state = getNextState(this._state);

    this._regularSeason = new RegularSeason(this.teams, this.triggerTrades);

    // needs to clear wins and losses from teams
    this._conferences.allTeams.forEach((team: Team) => {
      team.wins = 0;
      team.losses = 0;
    });
  }

  simFreeAgency(): void {
    this._freeAgents.sim(this.teams);
  }

  // get functions
  get year(): number {
    return this._year;
  }

  get winner(): Team {
    if (!this._playoffs.winner) {
      throw new Error("Playoffs not completed");
    }

    return this._playoffs.winner;
  }

  get regularSeason(): RegularSeason {
    return this._regularSeason;
  }

  get playoffs(): Playoffs {
    return this._playoffs;
  }

  get draft(): Draft {
    return this._draft;
  }

  get freeAgents(): FreeAgents {
    return this._freeAgents;
  }

  get teams(): Team[] {
    return this._conferences.allTeams;
  }

  get players(): Player[] {
    return this._players;
  }

  get standings(): [Team[], Team[]] {
    return this._conferences.standings;
  }

  get state(): LeagueState {
    return this._state;
  }
}
