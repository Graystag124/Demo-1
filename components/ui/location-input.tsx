"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin, Search, Plus, X } from "lucide-react";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (locationData: any) => void;
  placeholder?: string;
}

export function LocationInput({ 
  value, 
  onChange, 
  onLocationSelect, 
  placeholder = "Search location (e.g. Social, Bengaluru)" 
}: LocationInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [initialValue] = React.useState(value); // Store the initial value

  // Bounding box for India to force local results
  // Format: min_lon,min_lat,max_lon,max_lat
  const INDIA_BBOX = "68.1,6.5,97.4,37.6";

  const handleSearch = React.useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Increased limit to 15
        // 2. Added bbox to force India search
        // 3. Added lang=en to ensure English results
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&bbox=${INDIA_BBOX}&limit=15&lang=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          setResults(data.features || []);
        }
      } catch (error) {
        console.error("Location search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const formatPhotonResult = (feature: any) => {
    const p = feature.properties;
    const mainText = p.name || p.street || p.city || p.district;
    
    // Build a cleaner address string
    const addressParts = [
      p.street,
      p.suburb,
      p.district, 
      p.city, 
      p.state, 
    ].filter((part) => part && part !== mainText);
    
    const uniqueAddress = [...new Set(addressParts)].join(", ");

    return { 
      mainText, 
      secondaryText: uniqueAddress,
      fullAddress: `${mainText}${uniqueAddress ? `, ${uniqueAddress}` : ''}` 
    };
  };

  const handleSelect = (selectedValue: string, data?: any) => {
    const trimmedValue = selectedValue.trim();
    if (trimmedValue === '') {
      toast({
        title: "Invalid Location",
        description: "Please enter a valid location",
        variant: "destructive"
      });
      return;
    }
    
    onChange(trimmedValue);
    if (onLocationSelect && data) onLocationSelect(data);
    setOpen(false);
    setInputValue(trimmedValue); // Update input with the selected value
  };

  // Update input value when value prop changes (for edit mode)
  React.useEffect(() => {
    if (value && value !== inputValue && !open) {
      setInputValue(value);
    }
  }, [value, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-3 h-auto min-h-[44px] py-2 text-left bg-background hover:bg-white"
        >
          {value ? (
            <div className="flex items-center w-full gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="truncate text-sm font-medium leading-none mb-1">
                  {value.split(",")[0]} 
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {value.split(",").slice(1).join(", ")}
                </span>
              </div>
              <div 
                role="button"
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Search className="h-4 w-4" />
              {placeholder}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[calc(100vw-40px)] sm:w-[450px] p-0" align="start">
        <Command shouldFilter={false} className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Type place name..."
            value={inputValue}
            onValueChange={(text) => {
              setInputValue(text);
              handleSearch(text);
            }}
          />
          <CommandList className="max-h-[300px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Searching locations...</span>
              </div>
            )}
            
            {/* 
              This is the key fix: 
              If specific results aren't found, we allow the user to 
              click "Use [what they typed]" manually.
            */}
            {!isLoading && (inputValue.length > 1 || (value && inputValue === value)) && (
              <CommandGroup>
                <CommandItem
                  value="custom-input"
                  onSelect={() => handleSelect(inputValue)}
                  className="cursor-pointer border-b"
                >
                  <Plus className="mr-3 h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                     <span className="font-medium text-blue-600">
                       {value === inputValue ? 'Currently selected' : `Use "${inputValue}"`}
                     </span>
                     <span className="text-xs text-muted-foreground">
                       Can't find it on the map? Add it manually.
                     </span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            {!isLoading && results.length > 0 && (
              <CommandGroup heading="Suggestions">
                {results.map((feature, index) => {
                  const { mainText, secondaryText, fullAddress } = formatPhotonResult(feature);
                  const uniqueKey = `${feature.properties.osm_id}-${index}`;

                  return (
                    <CommandItem
                      key={uniqueKey}
                      value={fullAddress}
                      onSelect={() => handleSelect(fullAddress, feature)}
                      className="cursor-pointer py-3"
                    >
                      <MapPin className={cn(
                        "mr-3 h-5 w-5 shrink-0 mt-0.5",
                        value === fullAddress ? "text-primary" : "text-muted-foreground"
                      )} />
                      
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="font-semibold text-sm truncate">
                          {mainText}
                        </span>
                        {secondaryText && (
                          <span className="text-xs text-muted-foreground truncate">
                            {secondaryText}
                          </span>
                        )}
                      </div>

                      {value === fullAddress && (
                        <Check className="ml-auto h-4 w-4 text-primary shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
          
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-muted-foreground bg-muted/30 border-t">
            <span>Powered by OpenStreetMap</span>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}