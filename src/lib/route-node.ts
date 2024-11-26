import { UrlUtils } from './url.utils';

type RouteNodeObject = { [prop: symbol]: RouteNode };

type RouteNodeParams = { [prop: string]: string; };

export class RouteNode<TChildren extends RouteNodeObject = any, TParams extends RouteNodeParams = any, TQueryParams extends RouteNodeParams = any> {
  private _absoluteUrl?: string;

  constructor(
    private _relativeUrl: string = '',
    children?: TChildren,
    options?: {
      params?: TParams;
      queryParams?: TQueryParams;
    },
  ) {
    this.children = children ?? this.children;
    this.params = options?.params ?? this.params;
    this.queryParams = options?.queryParams ?? this.queryParams;

    if (this.children) {
      for (const child of Object.values<RouteNode>(this.children)) {
        child._setParent(this);
      }
    }

    this._validateParamsInUrl();
  }

  public get relativeUrl(): string {
    return this._relativeUrl;
  }

  public readonly children: TChildren = <TChildren>{};

  public get _(): TChildren {
    return this.children;
  }

  public readonly params: TParams = <TParams>{};
  public readonly queryParams: TQueryParams = <TQueryParams>{};

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
    return this.getRelativeWithParents(1);
  }

  public getRelativeWithParents(numberOfParents: number): string {
    if (numberOfParents > 1000) {
      throw new Error('Too high numberOfParents!');
    }

    let result = this.relativeUrl;

    let levels = numberOfParents;
    let currentParentNode: RouteNode | undefined = this.parent;

    while (currentParentNode && levels > 0) {
      if (currentParentNode.relativeUrl) {
        result = result ? `${ currentParentNode.relativeUrl }/${ result }` : currentParentNode.relativeUrl;
      }

      levels--;
      currentParentNode = currentParentNode.parent;
    }

    return result;
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