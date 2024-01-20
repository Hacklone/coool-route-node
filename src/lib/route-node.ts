import { UrlUtils } from './url.utils';

type RouteNodeObject = { [prop: symbol]: RouteNode };

type RouteNodeParams = { [prop: string]: string; };

export class RouteNode<TChildren extends RouteNodeObject = any, TParams extends RouteNodeParams = any, TQueryParams extends RouteNodeParams = any> {
  private _absoluteUrl?: string;

  constructor(
    public relativeUrl: string,
    options: {
      children?: TChildren;
      params?: TParams;
      queryParams?: TQueryParams;
    } = {},
  ) {
    this.children = options.children ?? this.children;
    this.params = options.params ?? this.params;
    this.queryParams = options.queryParams ?? this.queryParams;

    if (this.children) {
      for (const child of Object.values<RouteNode>(this.children)) {
        child._setParent(this);
      }
    }

    this._validateParamsInUrl();
  }

  public readonly children: TChildren = <any>{};
  public readonly params: TParams = <any>{};
  public readonly queryParams: TQueryParams = <any>{};

  public parent: RouteNode | undefined;

  public get absoluteUrl(): string {
    if (!this._absoluteUrl) {
      if (this.relativeUrl) {
        this._absoluteUrl = (this.parent?.absoluteUrl || '') + '/' + this.relativeUrl;
      } else {
        this._absoluteUrl = (this.parent?.absoluteUrl || '');
      }
    }

    return this._absoluteUrl;
  }

  public get absoluteUrlWithoutLeading(): string {
    return this.absoluteUrl.slice(1);
  }

  public get relativeUrlWithParent(): string {
    if (!this.parent) {
      return this.relativeUrl;
    }

    return `${ this.parent.relativeUrl }/${ this.relativeUrl }`;
  }

  public getAbsoluteUrlWithParams(params: { [prop: string]: string }, query?: { [prop: string]: string | undefined }) {
    let result = this.absoluteUrl;

    for (const [param, val] of Object.entries(params)) {
      result = result.replace(':' + param, val);
    }

    if (query) {
      result = UrlUtils.addQueryToUrl(result, query);
    }

    return result;
  }

  public getAbsoluteUrlWithQuery(query: { [prop: string]: string | undefined }) {
    return UrlUtils.addQueryToUrl(this.absoluteUrl, query);
  }

  private _setParent(parent: RouteNode) {
    this.parent = parent;
  }

  private _validateParamsInUrl() {
    const paramsFoundInUrl = this.relativeUrl.match(/:[^\/]*/g);

    if (paramsFoundInUrl?.length) {
      const paramsValues = new Set(Object.values(this.params).map(_ => `:${ _ }`));

      const missingParamDefinitions = paramsFoundInUrl.filter(paramInUrl => !paramsValues.has(paramInUrl));

      if (missingParamDefinitions.length) {
        throw new Error(`Missing param definition\n\t-> RouteNode: "${ this.absoluteUrl }"\n\t-> Missing params: ${ missingParamDefinitions.join(', ') }`);
      }
    }
  }
}
