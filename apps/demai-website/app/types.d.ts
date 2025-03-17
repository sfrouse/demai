export type SpaceParams = {
  locale: string;
  spaceId: string;
  spaceName: string;
  cda: string;
  cpa: string;
  slug: string;
  preview: boolean;
  environment: string;
};

type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export type SpaceParamsPartial = PartialWithRequired<
  SpaceParams,
  "spaceId" | "spaceName" | "cda" | "cpa" | "environment"
>;
