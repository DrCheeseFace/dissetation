import type { ColumnSummary } from '@/model/DashboardInfo';
import { observer } from 'mobx-react-lite';
import { type FC } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { TypographyH2, TypographyP } from './typography';
import MissigGlyph from './missigGlyph';
import { useRootStore } from '@/mobx/rootstore';

interface MissigGlyphCardProps {
  columnSummary: ColumnSummary;
  onClick: (name: string) => void;
  isSelected: boolean;
}

export const MissigGlyphCard: FC<MissigGlyphCardProps> = observer(
  ({ columnSummary, onClick, isSelected }) => {
    onClick;
    const { dashboardStore } = useRootStore();

    const total =
      (columnSummary.non_null_count || 0) + (columnSummary.null_count || 0);
    let missingPct = total > 0 ? (columnSummary.null_count / total) * 100 : 0;

    return (
      <Card
        onClick={() => onClick(columnSummary.column_name)}
        className={`relative flex flex-col w-full aspect-[3/5] pt-3 overflow-hidden cursor-pointer transition-all ${
          isSelected
            ? 'ring-4 ring-red-500 ring-inset'
            : 'hover:bg-slate-50 border-slate-200'
        }`}
      >
        <CardHeader className="shrink-0 items-center">
          <CardTitle className="truncate pb-1 text-center w-full">
            <TypographyH2>{columnSummary.column_name}</TypographyH2>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow flex items-center justify-center min-h-0 p-1 px-[5px] ">
          <MissigGlyph columnSummary={columnSummary} />
        </CardContent>

        <CardFooter className="flex-col shrink-0">
          <TypographyP>type: {columnSummary.histogram?.data_type}</TypographyP>
          <TypographyP>
            total missingness: {missingPct.toPrecision(3)}%
          </TypographyP>
          <TypographyP>
            joint missingness :{' '}
            {/* this is here because there needs to be a trailing space */}
            {dashboardStore.selectedGlyphIdx == -1
              ? 'NA'
              : columnSummary.joint_missingness[
                  dashboardStore.selectedGlyphIdx
                ]}
            %
          </TypographyP>
        </CardFooter>
      </Card>
    );
  },
);

export default MissigGlyphCard;
