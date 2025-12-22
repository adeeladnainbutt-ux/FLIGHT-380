import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { Filter, X } from 'lucide-react';

export const MobileFilterButton = ({ children, filterCount = 0, onClearAll }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg rounded-full px-6 h-12 text-base font-semibold"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {filterCount > 0 && (
              <span className="ml-2 bg-white text-brand-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {filterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <SheetHeader className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
              {filterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearAll}
                  className="text-brand-600 hover:text-brand-700 text-sm"
                >
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>
          <div className="overflow-y-auto p-4 pb-24" style={{ maxHeight: 'calc(85vh - 140px)' }}>
            {children}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button 
              className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-base font-semibold"
              onClick={() => setOpen(false)}
            >
              Show Results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
