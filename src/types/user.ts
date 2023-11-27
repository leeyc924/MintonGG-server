/**
 * 유저 티어 정보
 * 0: 알수 없음
 * 1 ~ 5: 1~5 티어
 */
export type Tier = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * 성별 정보
 * F: 여자
 * M: 남자
 */
export type Gender = 'F' | 'M';

export interface User {
  /**
   * 유저 고유 ID
   */
  userId: string;
  /**
   * 유저 이름
   */
  userName: string;
  /**
   * 유저 나이
   */
  userAge: number;
  /**
   * 성별 정보
   * F: 여자
   * M: 남자
   */
  userGender: Gender;
  /**
   * 사는 지역
   */
  userAddress: string;
  /**
   * 가입 날짜
   */
  userJoinDt: string;
  /**
   * 등록 날짜
   */
  regDt: string;
  /**
   * 수정 날짜
   */
  modDt: string;
}

export interface UserTier {
  /**
   * 유저 고유 ID
   */
  userId: string;
  /**
   * 유저 티어 정보
   * 0: 알수 없음
   * 1 ~ 5: 1~5 티어
   */
  userTier: Tier;
  /**
   * 수정 날짜
   */
  modDt: string;
}

export interface UserWarning {
  /**
   * 유저 고유 ID
   */
  userId: string;
  /**
   * 경고 내용
   */
  warningDesc: string;
}
